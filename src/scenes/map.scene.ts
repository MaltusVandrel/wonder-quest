import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color.utils';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { MapPathUtils } from 'src/utils/map-path.utils';

export class MapScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    font: '10px Courier',
    color: '#000000',
  };

  tileSize: number = 32;
  centeringOffset: number = this.tileSize / 2;
  map: any = [];
  player: Phaser.GameObjects.Ellipse | undefined;

  tileLayer: Phaser.GameObjects.Layer | undefined;
  pathLayer: Phaser.GameObjects.Layer | undefined;
  playerLayer: Phaser.GameObjects.Layer | undefined;
  textLayer: Phaser.GameObjects.Layer | undefined;
  pathLayerGraphics: Phaser.GameObjects.Graphics | undefined;
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
    MapGeneratorUtils.initSeed('alessandro-oliveira');
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
        this.playerPositionUpdate(-this.offsetX, -this.offsetY);
        this.clearBullshit();
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
          if (!this.lockPath) this.doPath(x, y);
        });
        cell.addListener('pointerout', () => {
          cell.fillColor = cell.getData('color');
          cell.setStrokeStyle(0, 0xffffff);
        });
        /*
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
    let playerSize = this.tileSize - 2;
    let strokeSize = playerSize > 25 ? 3 : playerSize > 15 ? 2 : 1;
    const screenCenterX = Math.ceil(this.width / 2);
    const screenCenterY = Math.ceil(this.height / 2);
    this.player = this.add.ellipse(
      screenCenterX * this.tileSize + this.centeringOffset,
      screenCenterY * this.tileSize + this.centeringOffset,
      playerSize,
      playerSize,
      0xffff00
    );
    this.player.setData({
      y: screenCenterY,
      x: screenCenterX,
      currentPositionY: screenCenterY,
      currentPositionX: screenCenterX,
      currentY: screenCenterY * this.tileSize + this.centeringOffset,
      currentX: screenCenterX * this.tileSize + this.centeringOffset,
    });
    this.player.setStrokeStyle(strokeSize, 0x333333);
    this.player.setInteractive();
    this.playerLayer?.add(this.player);
  }
  doPath(x: number, y: number) {
    let steps = MapPathUtils.calculatePath(
      this.player?.getData('x'),
      this.player?.getData('y'),
      x,
      y,
      this.height,
      this.width
    );
    //exibir path
    this.pathLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    this.pathLayerGraphics?.clear();
    this.pathLayerGraphics?.destroy();
    this.pathLayerGraphics = this.add.graphics();
    this.pathLayerGraphics.lineStyle(2, 0xffffff, 1);

    for (let i = 1; i < steps.length; i++) {
      let lastStep = steps[i - 1];
      let step = steps[i];
      let key = step.x + ';' + step.y;

      let directionX = lastStep.x - step.x;
      let directionY = lastStep.y - step.y;

      this.pathLayerGraphics.lineBetween(
        lastStep.x * this.tileSize + this.centeringOffset,
        lastStep.y * this.tileSize + this.centeringOffset,
        step.x * this.tileSize + this.centeringOffset,
        step.y * this.tileSize + this.centeringOffset
      );
    }
    this.pathLayer?.add(this.pathLayerGraphics);
  }
  playerPositionUpdate(x: number, y: number) {
    this.player?.setPosition(
      this.player.getData('currentX') + x * this.tileSize,
      this.player.getData('currentY') + y * this.tileSize
    );
    const newX = this.player?.getData('currentPositionX') + x;
    const newY = this.player?.getData('currentPositionY') + y;
    this.player?.setData({
      x: newX,
      y: newY,
    });
  }
  clearBullshit() {
    this.pathLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    this.pathLayerGraphics?.clear();
    this.pathLayerGraphics?.destroy();
  }
}
