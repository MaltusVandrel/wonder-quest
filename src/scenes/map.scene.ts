import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';
import { ColorUtils } from 'src/utils/color.utils';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { MapUIScene } from './map.ui.scene';

export class MapScene extends Phaser.Scene {
  mapPathScene: any;
  mapPlayerScene: any;
  mapUIScene: any | MapUIScene;
  introductionScene: any;
  tileSize: number = 16;
  centeringOffset: number = this.tileSize / 2;
  map: any = [];

  tileLayer: Phaser.GameObjects.Layer | undefined;
  colorFilter: Phaser.GameObjects.Graphics | undefined;

  invalidCellCost = 9999999;
  screenGridXSize = 0;
  screenGridYSize = 0;
  gridOffsetX: number = 0;
  gridOffsetY: number = 0;

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
      this.mapUpdate();
    });
    MapGeneratorUtils.initSeed(GameDataService.GAME_DATA.mapSeed);
  }

  updateToCanvasSize() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.screenGridXSize = Math.ceil(height / this.tileSize);
    this.screenGridYSize = Math.ceil(width / this.tileSize);
  }

  create() {
    this.updateToCanvasSize();
    this.gridOffsetX += GameDataService.GAME_DATA.mapPos.x;
    this.gridOffsetY += GameDataService.GAME_DATA.mapPos.y;

    this.tileLayer = this.add.layer();
    this.mapUpdate();

    // Start the Player and Path scenes
    this.scene.launch('map-player-scene');
    this.scene.launch('map-path-scene');
    this.scene.launch('map-ui-scene');
    this.scene.launch('introduction-scene');
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

  mapUpdate() {
    MapGeneratorUtils.generateChunk(
      this.screenGridXSize,
      this.screenGridYSize,
      this.gridOffsetX,
      this.gridOffsetY
    );
    this.drawMap();
  }

  drawMap() {
    this.tileLayer?.getAll().forEach((element) => {
      element.destroy();
    });

    for (let y = 0; y < this.screenGridXSize; y++) {
      for (let x = 0; x < this.screenGridYSize; x++) {
        const biome = MapGeneratorUtils.getBiomeData(
          x + this.gridOffsetX,
          y + this.gridOffsetY
        );
        let cell = this.add.rectangle(
          x * this.tileSize + this.centeringOffset,
          y * this.tileSize + this.centeringOffset,
          this.tileSize,
          this.tileSize,
          biome.color
        );
        cell.setData({
          ...biome,
          x: x + this.gridOffsetX,
          y: y + this.gridOffsetY,
        });
        cell.setInteractive();

        cell.addListener('pointerover', () => {
          let color = Phaser.Display.Color.ValueToColor(cell.getData('color'));
          color.brighten(20);
          color.saturate(25);
          cell.fillColor = ColorUtils.colorToInteger(color);
          cell.setStrokeStyle(2, 0xffffff);
          if (!this.mapPathScene.lockPath) {
            this.mapPathScene.doPath(x, y);
            this.mapUIScene.showTileInfo(x, y);
          }
        });
        cell.addListener('pointerout', () => {
          cell.fillColor = cell.getData('color');
          cell.setStrokeStyle(0, 0xffffff);
        });

        cell.addListener('pointerup', () => {
          if (!this.mapPathScene.lockPath) this.mapPathScene.followPath(x, y);
        });

        this.tileLayer?.add(cell);
      }
    }
  }
  doColorFilter() {
    const width = this.screenGridYSize * this.tileSize;
    const height = this.screenGridXSize * this.tileSize;
    const time = GameDataService.getTimeData();
    if (this.colorFilter) {
      this.colorFilter.destroy();
    }
    this.colorFilter = this.add.graphics();
    if (time.hour >= 20 || time.hour < 5) {
      this.colorFilter.fillStyle(0x0000ff, 0.5); // Change the color and alpha as needed
    }

    if (
      (time.hour >= 5 && time.hour < 8) ||
      (time.hour >= 17 && time.hour < 20)
    ) {
      this.colorFilter.fillStyle(0xff5500, 0.5); // Change the color and alpha as needed
    }

    this.colorFilter.fillRect(0, 0, width, height);
    this.colorFilter.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }
}
