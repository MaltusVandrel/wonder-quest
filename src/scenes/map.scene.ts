import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';
import { ColorUtils } from 'src/utils/color.utils';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { MapUIScene } from './map.ui.scene';
import { setMapUpUI } from 'src/utils/ui-elements.util';

export class MapScene extends Phaser.Scene {
  static DIALOG_OPEN_COUNT = 0;
  static HOVER_UI_ELEMENT: boolean = false;
  mapPathScene: any;
  mapPlayerScene: any;
  mapUIScene: any | MapUIScene;
  introductionScene: any;
  tileSize: number = 12;
  centeringOffset: number = this.tileSize / 2;
  map: any = [];

  tileLayer: Array<Array<Phaser.GameObjects.Rectangle>> = [];
  colorFilter: Phaser.GameObjects.Graphics | undefined;

  screenGridHeightSize = 0;
  screenGridWidthSize = 0;
  gridOffsetX: number = 0;
  gridOffsetY: number = 0;
  actualGridCenter: { x: number; y: number } = { x: 0, y: 0 };
  activeCell: Phaser.GameObjects.Rectangle | undefined;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({ key: 'map-scene' });
  }

  preload() {
    this.load.spritesheet('tiles', '../assets/tiles.png', {
      frameWidth: this.tileSize,
      frameHeight: this.tileSize,
    });
    window.addEventListener('resize', () => {
      this.updateToCanvasSize();
      this.gridCenter();

      this.scene.stop('map-player-scene');
      this.scene.stop('map-path-scene');
      this.scene.stop('map-ui-scene');
      this.scene.launch('map-player-scene');
      this.scene.launch('map-path-scene');
      this.scene.launch('map-ui-scene');

      this.redrawGrid();
      const newGridCenter = this.gridCenter();
      this.moveCamera(
        this.actualGridCenter.x - newGridCenter.x,
        this.actualGridCenter.y - newGridCenter.y
      );
      this.actualGridCenter = newGridCenter;
      this.doColorFilter();
    });
    MapGeneratorUtils.initSeed(GameDataService.GAME_DATA.mapSeed);
  }

  updateToCanvasSize() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.screenGridHeightSize = Math.ceil(height / this.tileSize);
    this.screenGridWidthSize = Math.ceil(width / this.tileSize);
  }

  create() {
    this.updateToCanvasSize();
    setMapUpUI();
    this.actualGridCenter = this.gridCenter();

    const diffPlayerCenter = {
      x: GameDataService.GAME_DATA.playerPos.x - this.actualGridCenter.x,
      y: GameDataService.GAME_DATA.playerPos.y - this.actualGridCenter.y,
    };
    this.gridOffsetX += GameDataService.GAME_DATA.mapPos.x + diffPlayerCenter.x;
    this.gridOffsetY += GameDataService.GAME_DATA.mapPos.y + diffPlayerCenter.y;

    this.tileLayer = [];
    this.mapUpdate(true);

    // Start the Player and Path scenes
    this.scene.launch('map-player-scene');
    this.scene.launch('map-path-scene');
    this.scene.launch('map-ui-scene');

    this.mapPathScene = this.scene.get('map-path-scene');
    this.mapPlayerScene = this.scene.get('map-player-scene');
    this.mapUIScene = this.scene.get('map-ui-scene');
    this.introductionScene = this.scene.get('introduction-scene');

    this.doColorFilter();
  }

  moveCamera(incrementOnOffsetX: number, incrementOnOffsetY: number) {
    this.gridOffsetX += incrementOnOffsetX;
    this.gridOffsetY += incrementOnOffsetY;
    this.mapUpdate();
  }

  mapUpdate(isFirstTime: boolean = false) {
    if (isFirstTime) this.setGrid();
    MapGeneratorUtils.generateChunk(
      this.screenGridHeightSize,
      this.screenGridWidthSize,
      this.gridOffsetX,
      this.gridOffsetY
    );
    GameDataService.GAME_DATA.mapPos = {
      x: this.gridOffsetX,
      y: this.gridOffsetY,
    };
    GameDataService.GAME_DATA.playerPos = this.gridCenter();
    this.drawMap();
  }
  getCell(x: number, y: number): Phaser.GameObjects.Rectangle {
    return this.tileLayer[y][x];
  }
  redrawGrid() {
    this.clearGrid();
    this.setGrid();
    this.drawMap();
  }
  clearGrid() {
    this.tileLayer.forEach((row) => {
      row.forEach((cell) => {
        cell.destroy();
      });
    });
    this.tileLayer = [];
  }
  setGrid() {
    const defaultColor = 0x000000;
    for (let y = 0; y < this.screenGridHeightSize; y++) {
      if (!this.tileLayer[y]) this.tileLayer[y] = [];

      for (let x = 0; x < this.screenGridWidthSize; x++) {
        let cell = this.add.rectangle(
          x * this.tileSize + this.centeringOffset,
          y * this.tileSize + this.centeringOffset,
          this.tileSize,
          this.tileSize,
          defaultColor
        );

        cell.setData({
          x: x,
          y: y,
          color: defaultColor,
        });
        cell.setInteractive();
        cell.addListener('pointerover', () => {
          if (MapScene.isUiBlocking()) return;
          this.activeCell = cell;
          let color = Phaser.Display.Color.ValueToColor(
            cell.getData('biome').color
          );
          color.brighten(20);
          color.saturate(25);
          cell.fillColor = ColorUtils.colorToInteger(color);
          cell.setStrokeStyle(2, 0xffffff);
          if (!this.mapPathScene.lockPath && !this.isGridCenter(x, y)) {
            this.mapPathScene.doPath(x, y);
            this.mapUIScene.showTileInfo(x, y);
          }
        });
        cell.addListener('pointerout', () => {
          //if (MapScene.isUiBlocking()) return;
          cell.fillColor = cell.getData('biome').color;
          cell.setStrokeStyle(0, 0xffffff);
        });

        cell.addListener('pointerup', () => {
          if (MapScene.isUiBlocking()) return;
          if (!this.mapPathScene.lockPath && !this.isGridCenter(x, y)) {
            this.mapPathScene.followPath(x, y);
          }
        });

        this.tileLayer[y][x] = cell;
      }
    }
  }
  drawMap() {
    /* RIP easy life, here laied a destruct and redraw, easy, hot and loyal.*/
    for (let y = 0; y < this.screenGridHeightSize; y++) {
      const newY = y + this.gridOffsetY;
      for (let x = 0; x < this.screenGridWidthSize; x++) {
        const newX = x + this.gridOffsetX;
        const biome = MapGeneratorUtils.getBiomeData(newX, newY);

        let cell = this.tileLayer[y][x];
        if (cell.getData('biome')?.color != biome.color) {
          cell.fillColor = biome.color;
        }
        cell.setData({
          biome: biome,
          x: newX,
          y: newY,
        });
      }
    }
  }
  doColorFilter() {
    const width = this.screenGridWidthSize * this.tileSize;
    const height = this.screenGridHeightSize * this.tileSize;
    const time = GameDataService.getTimeData();
    if (this.colorFilter) {
      this.colorFilter.destroy();
    }
    this.colorFilter = this.add.graphics();
    if (time.hours >= 20 || time.hours < 5) {
      this.colorFilter.fillStyle(0x0000ff, 0.5); // Change the color and alpha as needed
    }

    if (
      (time.hours >= 5 && time.hours < 8) ||
      (time.hours >= 17 && time.hours < 20)
    ) {
      this.colorFilter.fillStyle(0xff5500, 0.5); // Change the color and alpha as needed
    }

    this.colorFilter.fillRect(0, 0, width, height);
    this.colorFilter.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }
  gridCenter(): { x: number; y: number } {
    const x = Math.ceil(this.game.scale.width / this.tileSize / 2);
    const y = Math.ceil(this.game.scale.height / this.tileSize / 2);
    return { x: x, y: y };
  }
  isGridCenter(x: number, y: number): boolean {
    const centerPos = this.gridCenter();
    return centerPos.x == x && centerPos.y == y;
  }
  static isUiBlocking(): boolean {
    return MapScene.DIALOG_OPEN_COUNT > 0 || MapScene.HOVER_UI_ELEMENT;
  }
}
