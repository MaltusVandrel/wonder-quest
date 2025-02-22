import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color-utils';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
export class MapScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    font: '10px Courier',
    color: '#000000',
  };

  size: number = 20;
  offset: number = this.size / 2;
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

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  create() {
    this.map = [];
    this.tileLayer = this.add.layer();
    this.pathLayer = this.add.layer();
    this.playerLayer = this.add.layer();
    this.textLayer = this.add.layer();
    for (let y = 0; y < mapData.length; y++) {
      let mapLine = mapData[y];
      this.map[y] = [];
      for (let x = 0; x < mapLine.length; x++) {
        let mapCell: number = mapLine[x];
        this.doMapCell(x, y, mapCell);
      }
    }
    this.doPlayer();
  }
  
  calculatePath(x: number, y: number): void {
    let targetCellCost = { ...mapDefinitions }[mapData[y][x]]?.cost;
    if (targetCellCost == null || targetCellCost >= this.invalidCellCost)
      return;
    let maximumTiles = mapData.length * mapData[0].length;
    let cautionException = 100000 - 1;
    let originalX = this.player?.getData('x');
    let originalY = this.player?.getData('y');
    let pX = this.player?.getData('x');
    let pY = this.player?.getData('y');

    let steps = [];
    let uncoveredCells: any = [];
    let directions: any = [];
    directions.push([-1, -1]);
    directions.push([+0, -1]);
    directions.push([+1, -1]);
    directions.push([-1, +0]);
    directions.push([+1, +0]);
    directions.push([-1, +1]);
    directions.push([+0, +1]);
    directions.push([+1, +1]);

    uncoveredCells[originalX + ';' + originalY] = {
      cost: Math.abs(originalX - x) + Math.abs(originalY - y),
      stepped: true,
    };
    steps.push({ x: originalX, y: originalY });
    while (
      (pX != x || pY != y) &&
      steps.length < maximumTiles &&
      steps.length < cautionException
    ) {
      //uncoverCells
      for (let direction of directions) {
        let dX = direction[0];
        let dY = direction[1];
        let sX = pX + dX;
        let sY = pY + dY;
        if (!(sX >= 0 && sX < mapData[0].length)) continue;
        if (!(sY >= 0 && sY < mapData.length)) continue;
        let cost = { ...mapDefinitions }[mapData[sY][sX]]?.cost;
        if (!uncoveredCells[sX + ';' + sY]) {
          let baseCost = Math.sqrt(Math.abs(dX) + Math.abs(dY)); //G
          let cellCost = cost != undefined ? cost : 0; //peso
          let pathCost = Math.abs(sX - x) + Math.abs(sY - y); //H
          let totalCost = baseCost + pathCost + cellCost;
          uncoveredCells[sX + ';' + sY] = {
            cost: totalCost,
            stepped: false,
            x: sX,
            y: sY,
            direction: direction,
          };
        }
      }

      //chooseLowerCost
      let keys = Object.keys(uncoveredCells);
      let lowestPath = { cost: 9999, key: null, x: null, y: null };
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let cell = uncoveredCells[key];
        if (cell.stepped) continue;
        if (cell.cost < lowestPath.cost) {
          lowestPath = cell;
        }
      }

      //stepOnLowerCost
      pX = lowestPath.x;
      pY = lowestPath.y;
      uncoveredCells[pX + ';' + pY].stepped = true;
      steps.push({ x: pX, y: pY, cell: uncoveredCells[pX + ';' + pY] });
    }

    //limpar adjacentes
    for (let numDirections of directions) {
      adjacentsFor: for (let i = steps.length - 1; i > 0; i--) {
        let targeStep = steps[i];
        let tX = targeStep.x;
        let tY = targeStep.y;
        for (let j = i - 2; j >= 0; j--) {
          let otherStep = steps[j];
          let oX = otherStep.x;
          let oY = otherStep.y;
          directionsFor: for (let direction of directions) {
            let dX = direction[0];
            let dY = direction[1];
            if (dX + oX == tX && dY + oY == tY) {
              let startSteps = steps.slice(0, j + 1);
              let endSteps = steps.slice(i, steps.length);
              let newLength = startSteps.length + endSteps.length;
              let diffLength = steps.length - newLength;
              steps = startSteps.concat(endSteps);
              i = i - diffLength;
              j = j - diffLength;
              break directionsFor;
            }
          }
        }
      }
    }
    //exibir path
    this.pathLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    var graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);

    for (let i = 1; i < steps.length; i++) {
      let lastStep = steps[i - 1];
      let step = steps[i];
      let key = step.x + ';' + step.y;

      let d = step.cell.direction;
      let dx = d[0];
      let dy = d[1];

      graphics.lineBetween(
        lastStep.x * this.size + this.offset,
        lastStep.y * this.size + this.offset,
        step.x * this.size + this.offset,
        step.y * this.size + this.offset
      );
    }
    this.pathLayer?.add(graphics);
    this.pathSteps = steps;
  }

  movePlayerToCell(x: number, y: number): void {
    let stepIndex = 0;
    if (this.pathSteps == undefined || this.pathSteps.length <= 0) return;
    this.lockPath = true;
    let playerStep = () => {
      let step = this.pathSteps[stepIndex];
      let x = step.x;
      let y = step.y;

      this.player?.setX(this.size * x + this.offset);
      this.player?.setY(this.size * y + this.offset);
      this.player?.setData('x', x);
      this.player?.setData('y', y);
      stepIndex++;
      if (stepIndex < this.pathSteps.length) {
        setTimeout(playerStep, 90);
      } else {
        this.lockPath = false;
        this.pathLayer?.getAll().forEach((element) => {
          element.destroy();
        });
      }
    };
    playerStep();
  }
  doPlayer() {
    let playerSize = this.offset - 2;
    let strokeSize = playerSize > 25 ? 3 : playerSize > 15 ? 2 : 1;
    this.player = this.add.ellipse(
      this.size + this.offset,
      this.size + this.offset,
      playerSize,
      playerSize,
      0xffff00
    );

    this.player.setStrokeStyle(strokeSize, 0x000000);
    this.player.setData({ y: 1, x: 1 });
    this.player.setInteractive();
    this.player.addListener('pointerup', () => {
      this.textLayer?.setVisible(!this.textLayer?.visible);
    });
    this.playerLayer?.add(this.player);
  }
  doMapCell(x: number, y: number, mapCell: number) {
    let defs = { ...mapDefinitions }[mapCell];
    if (defs == undefined) defs = mapDefinitions[0];
    let fillColor = parseInt(defs.color, 16);
    let cell = this.add.rectangle(
      x * this.size + this.offset,
      y * this.size + this.offset,
      this.size,
      this.size,
      fillColor
    );
    cell.fillColor = fillColor;
    cell.setInteractive();
    if (defs.isValid) {
      cell.addListener('pointerover', () => {
        let integer = cell.fillColor;
        let color = ColorUtils.integerToColor(integer);
        color.brighten(20);
        color.saturate(25);
        cell.fillColor = ColorUtils.colorToInteger(color);
        cell.setStrokeStyle(2, 0xffffff);
        if (!this.lockPath) this.calculatePath(x, y);
      });
      cell.addListener('pointerout', () => {
        cell.fillColor = fillColor;
        cell.setStrokeStyle(0, 0xffffff);
      });
      cell.addListener('pointerup', () => {
        if (!this.lockPath) {
          this.calculatePath(x, y);
          this.movePlayerToCell(x, y);
        }
      });
    }
    cell.setData({ y: y, x: x });
    this.tileLayer?.add(cell);
    this.map[y][x] = { ...defs, x: x, y: y, element: cell };
  }
}
