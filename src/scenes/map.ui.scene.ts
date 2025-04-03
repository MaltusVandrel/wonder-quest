import * as Phaser from 'phaser';
import { UIElement } from 'src/core/ui-element';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { AppComponent } from 'src/app/app.component';
import { GameDataService } from 'src/services/game-data.service';
import { GAUGE_KEYS } from 'src/data/bank/gauge';
import { getRegionName } from 'src/data/bank/map-region';

export class MapUIScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4,
    fontSize: '20px',
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000000',
      blur: 10,
      stroke: true,
      fill: true,
    },
  };
  mapScene: any;
  mapPathScene: any;
  uiLayer: Phaser.GameObjects.Layer | undefined;
  uiElements: { [key: string]: any } = {};
  constructor() {
    super({ key: 'map-ui-scene' });
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.mapScene = this.scene.get('map-scene');
    this.mapPathScene = this.scene.get('map-path-scene');
    this.uiLayer = this.add.layer();
    this.showCurrentTime();
    this.showStaminaGauge();
    this.showRestButton();
    // Create UI elements
  }
  showRestButton() {
    let key: string = 'rest-button';
    if (this.uiElements[key]) {
      this.uiElements[key].destroy();
    }

    let element = this.add
      .text(
        this.getPosX(UIElement.ALIGNMENT.END, 0),
        this.getPosY(UIElement.ALIGNMENT.END, 12),
        `REST`,
        this.textStyle
      )
      .setOrigin(UIElement.ALIGNMENT.END, UIElement.ALIGNMENT.END)
      .setInteractive()
      .on('pointerup', () => {
        let stamina = GameDataService.GAME_DATA.playerData.getGauge(
          GAUGE_KEYS.STAMINA
        );
        stamina.consumed = 0;
        GameDataService.GAME_DATA.time += 8 * 60;
        this.mapScene.doColorFilter();
        this.showStaminaGauge();
        this.showCurrentTime();
      })
      .on('pointerover', () => {
        element.setShadow(0, 0, '#000000', 15, true, true);
      })
      .on('pointerout', () => {
        element.setShadow(0, 0, '#000000', 10, false, false);
      });

    this.uiElements[key] = element;
  }

  showStaminaGauge() {
    let key: string = 'status-info';
    if (this.uiElements[key]) {
      this.uiElements[key].destroy();
    }

    const stamina = GameDataService.GAME_DATA.playerData.getGauge(
      GAUGE_KEYS.STAMINA
    );
    const percentualStatus = (
      (stamina.getCurrentValue() / stamina.modValue) *
      100
    ).toFixed(2);
    let element = this.add
      .text(
        this.getPosX(UIElement.ALIGNMENT.END, 0),
        this.getPosY(UIElement.ALIGNMENT.START, 12),
        `stamina: ${percentualStatus}%`,
        this.textStyle
      )
      .setOrigin(UIElement.ALIGNMENT.END, UIElement.ALIGNMENT.START);
    this.uiElements[key] = element;
  }
  showCurrentTime() {
    let key: string = 'now-time';
    if (this.uiElements[key]) {
      this.uiElements[key].destroy();
    }

    const f = GameDataService.getFormattedTime();
    const formattedCurrentTime = `${f.hours}h ${f.minutes}m, day ${f.days} of ${f.months}º month of year ${f.years}`;
    let element = this.add
      .text(
        this.getPosX(UIElement.ALIGNMENT.CENTER, 12),
        this.getPosY(UIElement.ALIGNMENT.END, 12),
        formattedCurrentTime,
        this.textStyle
      )
      .setOrigin(UIElement.ALIGNMENT.CENTER, UIElement.ALIGNMENT.END);
    this.uiElements[key] = element;
  }
  showTileInfo(x: number, y: number) {
    //let tile = this.mapScene.getCell(x, y);
    const tileInfoX = x + this.mapScene.gridOffsetX;
    const tileInfoY = y + this.mapScene.gridOffsetY;
    let tileBiome = MapGeneratorUtils.getBiomeData(tileInfoX, tileInfoY);

    let key: string = 'tile-info';

    if (this.uiElements[key]) {
      this.uiElements[key].destroy();
    }

    let totalStaminaCost = 0;
    let totalTimeCost = 0;
    for (let step of this.mapPathScene.pathSteps) {
      if (!step.cell) continue;
      totalTimeCost += step.cell.timeCost;
      totalStaminaCost += step.cell.staminaCost;
    }
    let timeData = GameDataService.getTimeData(totalTimeCost);

    GameDataService.getFormattedTime();
    let formattedTimeCost = `${timeData.hours}h ${timeData.minutes}m ${timeData.seconds}s`;
    if (timeData.days > 0) {
      formattedTimeCost = `${timeData.days} days ` + formattedTimeCost;
    }
    let element = this.add
      .text(
        this.getPosX(UIElement.ALIGNMENT.START, 12),
        this.getPosY(UIElement.ALIGNMENT.END, 12),
        [
          getRegionName(tileInfoX, tileInfoY, tileBiome) +
            ' (' +
            tileInfoX +
            '/' +
            tileInfoY +
            ')',
          totalStaminaCost + ' Stamina Cost',
          formattedTimeCost,
        ],
        this.textStyle
      )
      .setOrigin(UIElement.ALIGNMENT.START, UIElement.ALIGNMENT.END);
    this.uiElements[key] = element;
  }

  getPosX(alignment: number, margin: number) {
    const width = parseInt(this.game?.scale?.width + '');
    if (alignment == UIElement.ALIGNMENT.END) {
      return width - margin;
    } else if (alignment == UIElement.ALIGNMENT.CENTER) {
      return Math.ceil(width / 2) + margin;
    } else {
      return 0 + margin;
    }
  }
  getPosY(alignment: number, margin: number) {
    const height = parseInt(this.game?.scale?.height + '');
    if (alignment == UIElement.ALIGNMENT.END) {
      return height - margin;
    } else if (alignment == UIElement.ALIGNMENT.CENTER) {
      return Math.ceil(height / 2) + margin;
    } else {
      return 0 + margin;
    }
  }
  updateUI(key: string, element: any) {
    for (let key of Object.keys(this.uiElements)) {
      let uiElement = this.uiElements[key];
      this.uiLayer?.add(uiElement);
    }
  }
}
