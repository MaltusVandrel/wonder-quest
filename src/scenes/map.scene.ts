import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color.util';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MapGeneratorUtils } from 'src/utils/map-generator.util';

export class MapScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    font: '10px Courier',
    color: '#000000',
  };

  tileSize: number = 16;
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
      });
    }
    this.mapUpdate();
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
    this.tileLayer?.removeAll();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const color = MapGeneratorUtils.getBiomeColor(
          x + this.offsetX,
          y + this.offsetY
        );
        let cell = this.add.rectangle(
          x * this.tileSize + this.centeringOffset,
          y * this.tileSize + this.centeringOffset,
          this.tileSize,
          this.tileSize,
          color
        );

        /*
        const frame = this.getTileFrame(e, m);
        let cell = this.add.sprite(
            x * this.size + this.offset,
            y * this.size + this.offset,
            'tiles',
            frame
        );
        */
        cell.setData({ y: y + this.offsetY, x: x + this.offsetX });
        this.tileLayer?.add(cell);
      }
    }
  }
}
