import { MapGeneratorUtils } from './map-generator.utils';

export class MapPathUtils {
  static calculatePath(
    playerX: number,
    playerY: number,
    x: number,
    y: number
  ): void {
    let targetCellCost = MapGeneratorUtils.generatedBiome[y][x]?.cost;
    if (targetCellCost == null || targetCellCost >= this.invalidCellCost)
      return;
    let maximumTiles = mapData.length * mapData[0].length;
    let cautionException = 100000 - 1;
    let originalX = playerX;
    let originalY = playerY;
    let pX = playerX;
    let pY = playerY;

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
}
