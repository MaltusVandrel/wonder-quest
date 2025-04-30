import * as Phaser from 'phaser';
import { MapPathUtils } from 'src/utils/map-path.utils';
import { GameDataService } from 'src/services/game-data.service';

import {
  checkIfEncountersHappensOnTravel,
  Encounter,
} from 'src/data/bank/encounter';
import { showEncounterDialog, showToast } from 'src/utils/ui-notification.util';
import { showStaminaGauge } from 'src/utils/ui-elements.util';
import { GAUGE_KEYS, GaugeCalc } from 'src/models/gauge';

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
      playerX > this.mapScene.screenGridWidthSize ||
      playerY < 0 ||
      playerY > this.mapScene.screenGridHeightSize
    ) {
      return;
    }

    let steps = MapPathUtils.calculatePath(
      playerX,
      playerY,
      x,
      y,
      this.mapScene.screenGridHeightSize,
      this.mapScene.screenGridWidthSize,
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
      const stamina = GameDataService.GAME_DATA.companyData.stamina;
      if (
        !GaugeCalc.canHandleValue(
          step.cell.staminaCost,
          GameDataService.GAME_DATA.companyData,
          stamina
        )
      ) {
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
      showStaminaGauge();
      GameDataService.GAME_DATA.time += step.cell.timeCost;
      this.mapUIScene.showCurrentTime();
      this.mapScene.doColorFilter();

      //Depois do passo ocorrer

      //encouter???
      const pos = this.mapScene.gridCenter();
      const triggeredEncounters: Array<Encounter> | null =
        checkIfEncountersHappensOnTravel(
          pos.x + this.mapScene.gridOffsetX,
          pos.y + this.mapScene.gridOffsetY
        );
      if (triggeredEncounters && triggeredEncounters.length > 0) {
        if (
          triggeredEncounters[triggeredEncounters.length - 1].demandsAttention
        ) {
          const encounterToDialog = triggeredEncounters.pop();
          if (encounterToDialog) {
            showEncounterDialog(encounterToDialog);
            this.mapScene.activeCell.fillColor =
              this.mapScene.activeCell.getData('biome').color;
            this.mapScene.activeCell.setStrokeStyle(0, 0xffffff);
            this.lockPath = false;
            this.clearPath();
            return;
          }
        }
        triggeredEncounters.forEach(showToast);
        //test if is blocking
        //this.lockPath = false;
        //this.clearPath();
        //return;
      }

      if (stepIndex < this.pathSteps.length) {
        setTimeout(playerStep, 1000 / 60); //60 fps
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
    this.pathSteps = [];
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
