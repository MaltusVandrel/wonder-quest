import * as Phaser from 'phaser';
import { UIElement } from 'src/core/ui-element';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { GameDataService } from 'src/services/game-data.service';

import { getRegionName } from 'src/data/bank/map-region';
import { MapScene } from './map.scene';

export class MapUIScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4,
    fontSize: '100%',
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
    this.mapScene = this.scene.get('map-scene');
    this.mapPathScene = this.scene.get('map-path-scene');
    this.uiLayer = this.add.layer();
    this.textStyle.fontSize = this.getFontSize();
    this.showCurrentTime();

    window.addEventListener('resize', () => {
      this.textStyle.fontSize = this.getFontSize();
    });

    // Create UI elements
  }
  getFontSize() {
    const width = parseInt(this.game?.scale?.width + '');
    const size = width * 0.018;
    if (size > 26) return '26px';
    if (size < 12) return '12px';
    return size + 'px';
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
