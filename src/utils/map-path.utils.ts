import { BIOME_DEFAULTS } from 'src/data/bank/biome';
import { MapGeneratorUtils } from './map-generator.utils';

export class MapPathUtils {
  static DIRECTIONS: any = [
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
    playerXOnScreenGridMap: number,
    playerYOnScreenGridMap: number,
    targetCellXOnScreenGridMap: number,
    targetCellYOnScreenGridMap: number,
    screenGridMapHeight: number,
    screenGridMapWidth: number,
    gridMapOffsetX: number,
    gridMapOffsetY: number
  ): any[] {
    let targetCell = MapGeneratorUtils.getBiomeData(
      targetCellXOnScreenGridMap,
      targetCellYOnScreenGridMap
    );
    let targetCellStaminaCost = targetCell.staminaCost;
    let targetCellTileCost = targetCell.timeCost;
    if (targetCellStaminaCost == null || targetCellTileCost == null) return [];
    let maximumTiles = screenGridMapHeight * screenGridMapWidth;
    let cautionException = 100000 - 1;
    let originalX = playerXOnScreenGridMap;
    let originalY = playerYOnScreenGridMap;
    let playerX = playerXOnScreenGridMap;
    let playerY = playerYOnScreenGridMap;

    let steps = [];
    let uncoveredCells: any = [];

    uncoveredCells[originalX + ';' + originalY] = {
      cost:
        Math.abs(originalX - targetCellXOnScreenGridMap) +
        Math.abs(originalY - targetCellYOnScreenGridMap),
      stepped: true,
    };
    steps.push({ x: originalX, y: originalY });
    while (
      (playerX != targetCellXOnScreenGridMap ||
        playerY != targetCellYOnScreenGridMap) &&
      steps.length < maximumTiles &&
      steps.length < cautionException
    ) {
      //uncoverCells
      for (let direction of this.DIRECTIONS) {
        let directionX = direction[0];
        let directionY = direction[1];
        let stepX = playerX + directionX;
        let stepY = playerY + directionY;
        //if (!(stepX >= 0 && stepX < screenGridMapWidth)) continue;
        //if (!(stepY >= 0 && stepY < screenGridMapHeight)) continue;
        let stepCell = MapGeneratorUtils.getBiomeData(
          stepX + gridMapOffsetX,
          stepY + gridMapOffsetY
        );
        let stepStaminaCost = stepCell.staminaCost;
        let stepTimeCost = stepCell.timeCost;

        if (!uncoveredCells[stepX + ';' + stepY]) {
          let directionCostModifier = Math.sqrt(
            Math.abs(directionX) + Math.abs(directionY)
          );
          let pathCost =
            Math.abs(stepX - targetCellXOnScreenGridMap) +
            Math.abs(stepY - targetCellYOnScreenGridMap);
          let staminaCostWeight = stepStaminaCost / BIOME_DEFAULTS.staminaCost;
          let timeCostWeight = (stepTimeCost / BIOME_DEFAULTS.timeCost) * 0.1;
          let weightCost =
            (staminaCostWeight + timeCostWeight) *
            (directionCostModifier * 0.3);
          weightCost = weightCost * 3;
          let referenceCost = pathCost + weightCost;
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
        key: playerXOnScreenGridMap + ';' + playerYOnScreenGridMap,
        x: playerXOnScreenGridMap,
        y: playerYOnScreenGridMap,
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
    //tambem util pra mostrar efeitos no calculo de peso
    steps = this.cleanAdjacentSteps(steps);
    return steps;
  }

  /*
   * @title:Remove adjacent steps from the path;
   * @description: It start from the last step, from it looks for the step two ;
   */
  private static cleanAdjacentSteps(originalSteps: any[]): any {
    let steps: any[] = originalSteps.concat([]);
    let thereIsAdjacent = false;
    do {
      thereIsAdjacent = false;
      targetStepFor: for (let i = steps.length - 1; i > 0; i--) {
        let targeStep = steps[i];
        let targetStepX = targeStep.x;
        let targetStepY = targeStep.y;
        otherStepFor: for (let j = i - 2; j >= 0; j--) {
          let otherStep = steps[j];
          let otherStepX = otherStep.x;
          let otherStepY = otherStep.y;
          //pula iteracao se nao for adjacente
          if (
            Math.abs(otherStepX - targetStepX) > 1 ||
            Math.abs(otherStepY - targetStepY) > 1
          ) {
            continue otherStepFor;
          }
          directionsFor: for (let direction of this.DIRECTIONS) {
            let directionX = direction[0];
            let directionY = direction[1];
            if (
              directionX + otherStepX == targetStepX &&
              directionY + otherStepY == targetStepY
            ) {
              let startSteps = steps.slice(0, j + 1);
              let endSteps = steps.slice(i, steps.length);
              let newLength = startSteps.length + endSteps.length;
              let diffLength = steps.length - newLength;
              steps = startSteps.concat(endSteps);
              i = i - diffLength;
              j = j - diffLength;
            }
          }
        }
      }
      currentStepFor: for (let i = 0; i < steps.length - 1; i++) {
        let currentStep = steps[i];
        let currentStepX = currentStep.x;
        let currentStepY = currentStep.y;
        aheadStepFor: for (let j = i + 2; j < steps.length; j++) {
          let aheadStep = steps[j];
          let aheadStepX = aheadStep.x;
          let aheadStepY = aheadStep.y;
          //pula iteracao se nao for adjacente
          if (
            Math.abs(aheadStepX - currentStepX) > 1 ||
            Math.abs(aheadStepY - currentStepY) > 1
          ) {
            continue aheadStepFor;
          }
          thereIsAdjacent = true;
          break currentStepFor;
        }
      }
    } while (thereIsAdjacent);
    return steps;
  }
}
