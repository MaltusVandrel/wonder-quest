import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color.utils';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';

export class MapScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    font: '10px Courier',
    color: '#000000',
  };

  tileSize: number = 24;
  centeringOffset: number = this.tileSize / 2;
  map: any = [];
  player: Phaser.GameObjects.Ellipse | undefined;

  tileLayer: Phaser.GameObjects.Layer | undefined;
  pathLayer: Phaser.GameObjects.Layer | undefined;
  playerLayer: Phaser.GameObjects.Layer | undefined;
  textLayer: Phaser.GameObjects.Layer | undefined;

  mapHeight = [];
  lockPath: boolean = false;
  pathSteps: any[] = [];
  invalidCellCost = 9999999;
  height = 0;
  width = 0;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({ key: 'MapScene' });
  }
  preload() {
    this.load.spritesheet('tiles', '../assets/tiles.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    window.addEventListener('resize', () => {
      this.updateToCanvasSize();
      this.mapUpdate();
    });
  }
  updateToCanvasSize() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.height = Math.ceil(height / this.tileSize);
    this.width = Math.ceil(width / this.tileSize);
  }
  create() {
    MapGeneratorUtils.initSeed('cool-cool');
    this.updateToCanvasSize();

    this.tileLayer = this.add.layer();
    const moveActions = [
      { key: 'keydown-D', x: 1, y: 0 },
      { key: 'keydown-W', x: 0, y: -1 },
      { key: 'keydown-A', x: -1, y: 0 },
      { key: 'keydown-S', x: 0, y: 1 },
    ];
    for (let action of moveActions) {
      this.input.keyboard?.on(action.key, () => {
        this.offsetX += action.x;
        this.offsetY += action.y;
        this.mapUpdate();
        this.playerUpdate(-this.offsetX, -this.offsetY);
      });
    }
    this.mapUpdate();
    this.doPlayer();
  }
  mapUpdate() {
    MapGeneratorUtils.generateChunk(
      this.height,
      this.width,
      this.offsetX,
      this.offsetY
    );
    this.drawMap();
  }
  // Desenha o mapa no canvas, colorindo cada célula conforme o bioma
  drawMap() {
    this.tileLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const biome = MapGeneratorUtils.getBiomeData(
          x + this.offsetX,
          y + this.offsetY
        );
        let cell = this.add.rectangle(
          x * this.tileSize + this.centeringOffset,
          y * this.tileSize + this.centeringOffset,
          this.tileSize,
          this.tileSize,
          biome.color
        );
        cell.setData(biome);
        cell.setInteractive();

        cell.addListener('pointerover', () => {
          let color = Phaser.Display.Color.ValueToColor(cell.getData('color'));
          color.brighten(20);
          color.saturate(25);
          cell.fillColor = ColorUtils.colorToInteger(color);
          cell.setStrokeStyle(2, 0xffffff);
          //if (!this.lockPath) this.calculatePath(x, y);
        });
        cell.addListener('pointerout', () => {
          cell.fillColor = cell.getData('color');
          cell.setStrokeStyle(0, 0xffffff);
        });
        /*
        cell.addListener('pointerout', () => {
          cell.fillColor = cell.getData('color');
          cell.setStrokeStyle(0, 0xffffff);
        });
        cell.addListener('pointerup', () => {
          if (!this.lockPath) {
            this.calculatePath(x, y);
            this.movePlayerToCell(x, y);
          }
        });
        */

        /*
        const frame = this.getTileFrame(e, m);
        let cell = this.add.sprite(
            x * this.size + this.offset,
            y * this.size + this.offset,
            'tiles',
            frame
        );
        */
        //cell.setData({ y: y + this.offsetY, x: x + this.offsetX });
        this.tileLayer?.add(cell);
      }
    }
  }

  doPlayer() {
    let playerSize = this.centeringOffset - 2;
    let strokeSize = playerSize > 25 ? 3 : playerSize > 15 ? 2 : 1;
    this.player = this.add.ellipse(
      Math.ceil(this.width / 2) * this.tileSize + this.centeringOffset,
      Math.ceil(this.height / 2) * this.tileSize + this.centeringOffset,
      playerSize,
      playerSize,
      0xffff00
    );
    this.player.setData({
      initialY:
        Math.ceil(this.height / 2) * this.tileSize + this.centeringOffset,
      initialX:
        Math.ceil(this.width / 2) * this.tileSize + this.centeringOffset,
    });
    this.player.setStrokeStyle(strokeSize, 0x333333);
    this.player.setInteractive();
    this.playerLayer?.add(this.player);
  }

  playerUpdate(x: number, y: number) {
    this.player?.setPosition(
      this.player.getData('initialX') + x * this.tileSize,
      this.player.getData('initialY') + y * this.tileSize
    );
  }
}
