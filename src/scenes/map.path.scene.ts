import * as Phaser from 'phaser';
import { MapPathUtils } from 'src/utils/map-path.utils';
import { MapScene } from './map.scene';
import { GameDataService } from 'src/services/game-data.service';
import { GAUGE_KEYS } from 'src/data/bank/gauge';

export class MapPathScene extends Phaser.Scene {
  mapScene: any;
  mapPlayerScene: any;
  mapUIScene: any;
  pathGraphics: Phaser.GameObjects.Graphics | undefined;
  pathSteps: any[] = [];
  lockPath: boolean = false;

  constructor() {
    super({ key: 'map-path-scene' });
  }

  create() {
    this.pathGraphics = this.add.graphics();
    this.mapPlayerScene = this.scene.get('map-player-scene');
    this.mapScene = this.scene.get('map-scene');
    this.mapUIScene = this.scene.get('map-ui-scene');
  }
  doPath(x: number, y: number) {
    let playerX = this.mapPlayerScene.player?.getData('x');
    let playerY = this.mapPlayerScene.player?.getData('y');
    if (
      playerX < 0 ||
      playerX > this.mapScene.screenGridYSize ||
      playerY < 0 ||
      playerY > this.mapScene.screenGridXSize
    ) {
      return;
    }

    let steps = MapPathUtils.calculatePath(
      playerX,
      playerY,
      x,
      y,
      this.mapScene.screenGridXSize,
      this.mapScene.screenGridYSize,
      this.mapScene.gridOffsetX,
      this.mapScene.gridOffsetY
    );

    this.drawPath(steps);
  }

  drawPath(steps: any[]) {
    this.pathGraphics?.clear();
    this.pathGraphics?.lineStyle(2, 0xffffff, 1);

    for (let i = 1; i < steps.length; i++) {
      let lastStep = steps[i - 1];
      let step = steps[i];
      this.pathGraphics?.lineBetween(
        lastStep.x * this.mapScene.tileSize + this.mapScene.centeringOffset,
        lastStep.y * this.mapScene.tileSize + this.mapScene.centeringOffset,
        step.x * this.mapScene.tileSize + this.mapScene.centeringOffset,
        step.y * this.mapScene.tileSize + this.mapScene.centeringOffset
      );
    }
    this.pathSteps = steps;
  }
  followPath(): void {
    let stepIndex = 1;
    if (this.pathSteps == undefined || this.pathSteps.length <= 0) return;
    this.lockPath = true;
    let playerStep = () => {
      const lastStep = this.pathSteps[stepIndex - 1];
      let step = this.pathSteps[stepIndex++];
      const stamina = GameDataService.GAME_DATA.playerData.getGauge(
        GAUGE_KEYS.STAMINA
      );
      if (!stamina.canHandleValue(step.cell.staminaCost)) {
        this.lockPath = false;
        this.clearPath();
        return;
      }

      let incrementOnOffsetX = lastStep.x - step.x;
      let incrementOnOffsetY = lastStep.y - step.y;

      GameDataService.GAME_DATA.mapPos.x -= incrementOnOffsetX;
      GameDataService.GAME_DATA.mapPos.y -= incrementOnOffsetY;

      this.mapScene.moveCamera(-incrementOnOffsetX, -incrementOnOffsetY);
      this.pathPositionUpdate(-incrementOnOffsetX, -incrementOnOffsetY);
      stamina.consumed += step.cell.staminaCost;
      this.mapUIScene.showStaminaGauge();
      GameDataService.GAME_DATA.time += step.cell.timeCost;
      this.mapUIScene.showCurrentTime();
      this.mapScene.doColorFilter();
      if (stepIndex < this.pathSteps.length) {
        setTimeout(playerStep, 1000 / 144); //60 fps
      } else {
        this.lockPath = false;
        this.clearPath();
      }
    };
    playerStep();
  }

  clearPath() {
    this.pathGraphics?.clear();
    this.pathGraphics?.destroy();
    this.pathGraphics = this.add.graphics();
  }
  pathPositionUpdate(incrementOnOffsetX: number, incrementOnOffsetY: number) {
    let pathX = this.pathGraphics?.x || 0;
    let pathY = this.pathGraphics?.y || 0;
    this.pathGraphics?.setX(
      pathX + -incrementOnOffsetX * this.mapScene.tileSize
    );
    this.pathGraphics?.setY(
      pathY + -incrementOnOffsetY * this.mapScene.tileSize
    );
  }
}
