import { BIOME_DEFAULTS } from 'src/data/bank/biome';
import { MapGeneratorUtils } from './map-generator.utils';

export class MapPathUtils {
  static directions: any = [
    [-1, -1],
    [+0, -1],
    [+1, -1],
    [-1, +0],
    [+1, +0],
    [-1, +1],
    [+0, +1],
    [+1, +1],
  ];

  static calculatePath(
    playerXOnMap: number,
    playerYOnMap: number,
    targetCellX: number,
    targetCellY: number,
    mapHeight: number,
    mapWidth: number
  ): any[] {
    let targetCell = MapGeneratorUtils.generatedBiome[targetCellY][targetCellX];
    let targetCellStaminaCost = targetCell.staminaCost;
    let targetCellTileCost = targetCell.timeCost;
    if (targetCellStaminaCost == null || targetCellTileCost == null) return [];
    let maximumTiles = mapHeight * mapWidth;
    let cautionException = 100000 - 1;
    let originalX = playerXOnMap;
    let originalY = playerYOnMap;
    let playerX = playerXOnMap;
    let playerY = playerYOnMap;

    let steps = [];
    let uncoveredCells: any = [];

    uncoveredCells[originalX + ';' + originalY] = {
      cost:
        Math.abs(originalX - targetCellX) + Math.abs(originalY - targetCellY),
      stepped: true,
    };
    steps.push({ x: originalX, y: originalY });
    while (
      (playerX != targetCellX || playerY != targetCellY) &&
      steps.length < maximumTiles &&
      steps.length < cautionException
    ) {
      //uncoverCells
      for (let direction of this.directions) {
        let directionX = direction[0];
        let directionY = direction[1];
        let stepX = playerX + directionX;
        let stepY = playerY + directionY;
        if (!(stepX >= 0 && stepX < mapWidth)) continue;
        if (!(stepY >= 0 && stepY < mapHeight)) continue;
        let stepStaminaCost =
          MapGeneratorUtils.generatedBiome[stepY][stepX].staminaCost;
        let stepTimeCost =
          MapGeneratorUtils.generatedBiome[stepY][stepX].timeCost;

        if (!uncoveredCells[stepX + ';' + stepY]) {
          let baseCost = Math.sqrt(Math.abs(directionX) + Math.abs(directionY));
          let pathCost =
            Math.abs(stepX - targetCellX) + Math.abs(stepY - targetCellY);
          let referenceCost =
            pathCost +
            baseCost *
              (stepStaminaCost / BIOME_DEFAULTS.staminaCost +
                stepTimeCost / BIOME_DEFAULTS.timeCost);
          uncoveredCells[stepX + ';' + stepY] = {
            referenceCost: referenceCost,
            staminaCost: stepStaminaCost,
            timeCost: stepTimeCost,
            stepped: false,
            x: stepX,
            y: stepY,
            direction: direction,
          };
        }
      }

      //chooseLowerCost
      let keys = Object.keys(uncoveredCells);
      let lowestPath = {
        referenceCost: Number.MAX_SAFE_INTEGER,
        key: playerXOnMap + ';' + playerYOnMap,
        x: playerXOnMap,
        y: playerYOnMap,
      };
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let cell = uncoveredCells[key];
        if (cell.stepped) continue;
        if (cell.referenceCost < lowestPath.referenceCost) {
          lowestPath = cell;
        }
      }

      //stepOnLowerCost
      playerX = lowestPath.x;
      playerY = lowestPath.y;
      uncoveredCells[playerX + ';' + playerY].stepped = true;
      steps.push({
        x: playerX,
        y: playerY,
        cell: uncoveredCells[playerX + ';' + playerY],
      });
    }

    //limpar adjacentes
    for (let numDirections of this.directions) {
      adjacentsFor: for (let i = steps.length - 1; i > 0; i--) {
        let targeStep = steps[i];
        let tX = targeStep.x;
        let tY = targeStep.y;
        for (let j = i - 2; j >= 0; j--) {
          let otherStep = steps[j];
          let oX = otherStep.x;
          let oY = otherStep.y;
          directionsFor: for (let direction of this.directions) {
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

    return steps;
  }
}
