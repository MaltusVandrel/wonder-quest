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
  screenGridXSize = 0;
  screenGridYSize = 0;
  gridOffsetX: number = 0;
  gridOffsetY: number = 0;

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
    this.screenGridXSize = Math.ceil(height / this.tileSize);
    this.screenGridYSize = Math.ceil(width / this.tileSize);
  }
  create() {
    MapGeneratorUtils.initSeed('alessandro-oliveira');
    this.updateToCanvasSize();

    this.tileLayer = this.add.layer();
    /*
    this.input.keyboard?.on('keydown-W', () => {
      //dosomshit
    });
    */
    this.mapUpdate();
    this.doPlayer();
  }
  moveCamera(incrementOnOffsetX: number, incrementOnOffsetY: number) {
    this.gridOffsetX += incrementOnOffsetX;
    this.gridOffsetY += incrementOnOffsetY;
    this.mapUpdate();
    this.pathPositionUpdate(incrementOnOffsetX, incrementOnOffsetY);
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
  // Desenha o mapa no canvas, colorindo cada célula conforme o bioma
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
          if (!this.lockPath) this.doPath(x, y);
        });
        cell.addListener('pointerout', () => {
          cell.fillColor = cell.getData('color');
          cell.setStrokeStyle(0, 0xffffff);
        });

        cell.addListener('pointerup', () => {
          if (!this.lockPath) {
            this.doPath(x, y);
            this.movePlayerToCell(x, y);
          }
        });

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
    const screenCenterX = Math.ceil(this.screenGridYSize / 2);
    const screenCenterY = Math.ceil(this.screenGridXSize / 2);
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
    let playerX = this.player?.getData('x');
    let playerY = this.player?.getData('y');
    // se um dos sets de coordenadas X Y do player ou do parametro estiverem fora do mapa,
    // não faz nada
    if (
      playerX < 0 ||
      playerX > this.screenGridYSize ||
      playerY < 0 ||
      playerY > this.screenGridXSize
    ) {
      return;
    }

    let steps = MapPathUtils.calculatePath(
      playerX,
      playerY,
      x,
      y,
      this.screenGridXSize,
      this.screenGridYSize,
      this.gridOffsetX,
      this.gridOffsetY
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
      this.pathLayerGraphics.lineBetween(
        lastStep.x * this.tileSize + this.centeringOffset,
        lastStep.y * this.tileSize + this.centeringOffset,
        step.x * this.tileSize + this.centeringOffset,
        step.y * this.tileSize + this.centeringOffset
      );
    }
    this.pathLayer?.add(this.pathLayerGraphics);
    this.pathSteps = steps;
  }
  movePlayerToCell(x: number, y: number): void {
    let stepIndex = 1;
    if (this.pathSteps == undefined || this.pathSteps.length <= 0) return;
    this.lockPath = true;
    let playerStep = () => {
      const lastStep = this.pathSteps[stepIndex - 1];
      let step = this.pathSteps[stepIndex++];
      let x = step.x;
      let y = step.y;

      this.moveCamera(-(lastStep.x - step.x), -(lastStep.y - step.y));

      if (stepIndex < this.pathSteps.length) {
        setTimeout(playerStep, 90);
      } else {
        this.lockPath = false;
        this.clearLineOnViewOffsetChange();
      }
    };
    playerStep();
  }
  pathPositionUpdate(incrementOnOffsetX: number, incrementOnOffsetY: number) {
    let pathX = this.pathLayerGraphics?.x || 0;
    let pathY = this.pathLayerGraphics?.y || 0;
    this.pathLayerGraphics?.setX(pathX + -incrementOnOffsetX * this.tileSize);
    this.pathLayerGraphics?.setY(pathY + -incrementOnOffsetY * this.tileSize);
  }

  clearLineOnViewOffsetChange() {
    this.pathLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    this.pathLayerGraphics?.clear();
    this.pathLayerGraphics?.destroy();
  }
}
