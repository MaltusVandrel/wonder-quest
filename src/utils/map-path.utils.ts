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
    playerXOnRelativeGridMap: number,
    playerYOnRelativeGridMap: number,
    targetCellXOnRelativeGridMap: number,
    targetCellYOnRelativeGridMap: number,
    relativeGridMapHeight: number,
    relativeGridMapWidth: number,
    relativeGridMapOffsetX: number,
    relativeGridMapOffsetY: number
  ): any[] {
    let targetCell = MapGeneratorUtils.getBiomeData(
      targetCellXOnRelativeGridMap,
      targetCellYOnRelativeGridMap
    );
    let targetCellStaminaCost = targetCell.staminaCost;
    let targetCellTileCost = targetCell.timeCost;
    if (targetCellStaminaCost == null || targetCellTileCost == null) return [];
    let maximumTiles = relativeGridMapHeight * relativeGridMapWidth;
    let cautionException = 100000 - 1;
    let originalX = playerXOnRelativeGridMap;
    let originalY = playerYOnRelativeGridMap;
    let playerX = playerXOnRelativeGridMap;
    let playerY = playerYOnRelativeGridMap;
    console.log('player', playerX, playerY);
    console.log(
      'target',
      targetCellXOnRelativeGridMap,
      targetCellYOnRelativeGridMap
    );
    let steps = [];
    let uncoveredCells: any = [];

    uncoveredCells[originalX + ';' + originalY] = {
      cost:
        Math.abs(originalX - targetCellXOnRelativeGridMap) +
        Math.abs(originalY - targetCellYOnRelativeGridMap),
      stepped: true,
    };
    steps.push({ x: originalX, y: originalY });
    while (
      (playerX != targetCellXOnRelativeGridMap ||
        playerY != targetCellYOnRelativeGridMap) &&
      steps.length < maximumTiles &&
      steps.length < cautionException
    ) {
      //uncoverCells
      for (let direction of this.DIRECTIONS) {
        let directionX = direction[0];
        let directionY = direction[1];
        let stepX = playerX + directionX;
        let stepY = playerY + directionY;
        if (!(stepX >= 0 && stepX < relativeGridMapWidth)) continue;
        if (!(stepY >= 0 && stepY < relativeGridMapHeight)) continue;
        let stepCell = MapGeneratorUtils.getBiomeData(
          stepX + relativeGridMapOffsetX,
          stepY + relativeGridMapOffsetY
        );
        let stepStaminaCost = stepCell.staminaCost;
        let stepTimeCost = stepCell.timeCost;

        if (!uncoveredCells[stepX + ';' + stepY]) {
          let directionCostModifier = Math.sqrt(
            Math.abs(directionX) + Math.abs(directionY)
          );
          let pathCost =
            Math.abs(stepX - targetCellXOnRelativeGridMap) +
            Math.abs(stepY - targetCellYOnRelativeGridMap);
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
        key: playerXOnRelativeGridMap + ';' + playerYOnRelativeGridMap,
        x: playerXOnRelativeGridMap,
        y: playerYOnRelativeGridMap,
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
