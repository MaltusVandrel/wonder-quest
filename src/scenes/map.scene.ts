import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color.utils';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';

export class MapScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    font: '10px Courier',
    color: '#000000',
  };
  mapPathScene: any;
  mapPlayerScene: any;
  tileSize: number = 16;
  centeringOffset: number = this.tileSize / 2;
  map: any = [];

  tileLayer: Phaser.GameObjects.Layer | undefined;
  pathLayer: Phaser.GameObjects.Layer | undefined;
  playerLayer: Phaser.GameObjects.Layer | undefined;
  textLayer: Phaser.GameObjects.Layer | undefined;

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
  }

  updateToCanvasSize() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.screenGridXSize = Math.ceil(height / this.tileSize);
    this.screenGridYSize = Math.ceil(width / this.tileSize);
  }

  create() {
    MapGeneratorUtils.initSeed('alessandro-oliveira');
    this.updateToCanvasSize();

    this.tileLayer = this.add.layer();
    this.mapUpdate();

    // Start the Player and Path scenes
    this.scene.launch('map-player-scene');
    this.scene.launch('map-path-scene');
    this.scene.launch('map-ui-scene');
    this.mapPathScene = this.scene.get('map-path-scene');
    this.mapPlayerScene = this.scene.get('map-player-scene');
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
          if (!this.mapPathScene.lockPath) this.mapPathScene.doPath(x, y);
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
}
