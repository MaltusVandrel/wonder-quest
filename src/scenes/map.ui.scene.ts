import * as Phaser from 'phaser';
import * as moment from 'moment';
import { UITextElement } from 'src/core/ui-text-element';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { AppComponent } from 'src/app/app.component';
import { GameDataService } from 'src/services/game-data.service';

export class MapUIScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4,
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
  textLayer: Phaser.GameObjects.Layer | undefined;
  uiElements: any = [];
  constructor() {
    super({ key: 'map-ui-scene' });
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.mapScene = this.scene.get('map-scene');
    this.mapPathScene = this.scene.get('map-path-scene');
    this.textLayer = this.add.layer();
    this.showCurrentTime();
    // Create UI elements
  }

  showCurrentTime() {
    let key: string = 'now-time';

    const f = GameDataService.getFormattedTime();
    const formattedCurrentTime = `${f.hour}h ${f.minutes}, ${f.day} of ${f.month} of ${f.year}`;
    let element = UITextElement.build(key)
      .addText(formattedCurrentTime)
      .setStyle({
        ...this.textStyle,
        fontSize: '20px',
      })
      .horizontalPosition(UITextElement.ALIGNMENT.CENTER, 0)
      .verticalPosition(UITextElement.ALIGNMENT.END, 12);
    this.uiElements[key] = element;

    this.updateUI();
  }
  showTileInfo(x: number, y: number) {
    let tile = MapGeneratorUtils.getBiomeData(
      x + this.mapScene.gridOffsetX,
      y + this.mapScene.gridOffsetY
    );

    let key: string = 'tile-info';
    let totalStaminaCost = 0;
    let totalTimeCost = 0;
    for (let step of this.mapPathScene.pathSteps) {
      if (!step.cell) continue;
      totalTimeCost += step.cell.timeCost;
      totalStaminaCost += step.cell.staminaCost;
    }
    let duration = moment.duration(totalTimeCost, 'minutes');
    let formattedTimeCost = `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
    if (duration.days() > 0) {
      formattedTimeCost = `${duration.days()} days ` + formattedTimeCost;
    }
    let element = UITextElement.build(key)
      .addText(tile.type.toUpperCase())
      .addText(totalStaminaCost + ' Stamina Cost')
      .addText(formattedTimeCost)
      .setStyle({
        ...this.textStyle,
        fontSize: '20px',
      })
      .horizontalPosition(UITextElement.ALIGNMENT.START, 12)
      .verticalPosition(UITextElement.ALIGNMENT.END, 12);

    this.uiElements[key] = element;
    this.updateUI();
  }

  updateUI() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');

    this.textLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    for (let key of Object.keys(this.uiElements)) {
      let element = this.uiElements[key];
      let x = 0;
      let y = 0;
      let originX = 0;
      let originY = 0;

      if (element.alignmentHorizontal == UITextElement.ALIGNMENT.END) {
        x = width - element.marginX;
        originX = 1;
      } else if (
        element.alignmentHorizontal == UITextElement.ALIGNMENT.CENTER
      ) {
        x = Math.ceil(width / 2) + element.marginX;
        originX = 0.5;
      } else {
        x = 0 + element.marginX;
        originX = 0;
      }
      if (element.alignmentVertical == UITextElement.ALIGNMENT.END) {
        y = height - element.marginY;
        originY = 1;
      } else if (element.alignmentVertical == UITextElement.ALIGNMENT.CENTER) {
        y = Math.ceil(height / 2) + element.marginY;
        originY = 0.5;
      } else {
        y = 0 + element.marginY;
        originY = 0;
      }
      let textElement = this.add
        .text(x, y, element.text, element.style)
        .setOrigin(originX, originY);
      this.textLayer?.add(textElement);
    }
  }
}
