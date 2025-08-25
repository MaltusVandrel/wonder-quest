import { Actor } from 'src/models/actor';
import {
  BattleActor,
  BattleContext,
  BattleInstructionExpression,
  BattleTeam,
} from './battle-context';
import { MoveBehaviour, MoveBonk, MoveExpression } from 'src/models/move';
import { StatCalc } from 'src/models/stats';
import {
  GAUGE_ABBREVIATION,
  GAUGE_KEYS,
  GaugeCalc,
  GaugeKey,
} from 'src/models/gauge';

export async function doAttack(
  battle: BattleContext,
  char: Actor,
  battleInstructionExpression: BattleInstructionExpression
) {
  let moveDept = 0;
  if (battleInstructionExpression.move) {
    const move: MoveExpression = battleInstructionExpression.move;
    let targets: Array<BattleActor> = [];
    let teamTargets: Array<BattleTeam> = [];

    const actorTargetsInstruction = battleInstructionExpression.actorTargets;
    const teamTargetsInstruction = battleInstructionExpression.teamTargets;
    if (
      actorTargetsInstruction &&
      actorTargetsInstruction[moveDept] &&
      actorTargetsInstruction[moveDept].length > 0
    ) {
      targets = targets.concat(actorTargetsInstruction[moveDept]);
    }
    if (
      teamTargetsInstruction &&
      teamTargetsInstruction[moveDept] &&
      teamTargetsInstruction[moveDept].length > 0
    ) {
      teamTargets = teamTargets.concat(teamTargetsInstruction[moveDept]);
      teamTargetsInstruction[moveDept].forEach((targetTeam) => {
        targets = targets.concat(targetTeam.actors);
      });
    }
    let moveTargets: Array<any> = [];
    let moveInfo = {
      actor: char,
      targets: moveTargets,
    };
    targets.forEach((aimedBattleActor: BattleActor) => {
      var hits = runMove(move, char, aimedBattleActor.character);

      hits.forEach((hit) => {
        let hitDmg = hit.value;
        var message = `${char.name} ${hit.action} ${aimedBattleActor.character.name} for ${hitDmg}dmg`;
        aimedBattleActor.character.gauges[GAUGE_KEYS.VITALITY].consumed +=
          hitDmg;
        battle.showHitTakenOnTargetUI();
        battle.writeMessage(message);
      });
    });
  }
}
//flaten context from [A][B][C] to a_b_c
function evaluate(expr: string, context: FlattenObject): any {
  const regex: RegExp = /\$[a-zA-Z0-9_.]+/g;
  let matches = expr.match(regex);
  let replaced = expr + '';
  if (matches != null) {
    matches.forEach((match) => {
      const path = match.slice(1).replaceAll('.', '_');
      replaced = replaced.replace(match, context[path] + '');
    });
  }
  console.log('replaced', replaced);
  var val: any = Function('"use strict";return (' + replaced + ')')();

  console.log('val', val);

  return val;
}
type FlattenObject = { [key: string]: any };

/**
 * Flattens a nested object into a single-level object
 * with keys joined by underscores.
 */
function flattenObject(obj: any, parentKey = ''): FlattenObject {
  let result: FlattenObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}_${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

function runMove(
  move: MoveExpression,
  source: Actor,
  target: Actor
): { type: 'HIT'; action: string; value: number }[] {
  console.log('###### MOVE ' + source.name + '  #####', source, target);

  var randoms = {
    random: Math.random(),
    random_1: Math.random(),
    random_2: Math.random(),
    random_3: Math.random(),
    random_4: Math.random(),
    random_5: Math.random(),
    random_6: Math.random(),
    random_7: Math.random(),
    random_8: Math.random(),
    random_9: Math.random(),
    random_10: Math.random(),
  };
  const ctx: FlattenObject = flattenObject({
    source: source,
    target: target,
    ...randoms,
  });
  var hits: { type: 'HIT'; action: string; value: number }[] = [];
  function execStep(step: MoveBehaviour) {
    console.log('step ' + step.type);
    switch (step.type) {
      case 'GET':
        ctx[step.key] = evaluate(step.value, ctx);
        break;
      case 'CONDITION':
        if (evaluate(step.check, ctx)) {
          step.then.forEach(execStep);
        } else {
          step.else?.forEach(execStep);
        }
        break;
      case 'HIT':
        var hit: { type: 'HIT'; action: string; value: number } = {
          type: 'HIT',
          action: 'bonked',
          value: evaluate(step.value, ctx),
        };
        if (hit.value == undefined) {
          console.log('UNDEFINED');
        }
        hits.push(hit);
        break;
      case 'APPLY':
        const tgt = evaluate(step.target, ctx);
        const val = evaluate(step.value, ctx);
        if (step.op === 'add') tgt[step.key] += val;
        if (step.op === 'sub') tgt[step.key] -= val;
        if (step.op === 'set') tgt[step.key] = val;
        break;
    }
  }

  move.steps.forEach(execStep);
  return hits;
}
export async function OLD_doAttack(
  battle: BattleContext,
  char: Actor,
  battleInstructionExpression: BattleInstructionExpression
) {
  let moveDept = 0;
  if (battleInstructionExpression.move) {
    //const battleActionTargets: BattleActionSlot = battleInstructionExpression.battleActionTargets
    const move: MoveExpression = battleInstructionExpression.move;
    let targets: Array<BattleActor> = [];
    let teamTargets: Array<BattleTeam> = [];

    const actorTargetsInstruction = battleInstructionExpression.actorTargets;
    const teamTargetsInstruction = battleInstructionExpression.teamTargets;
    if (
      actorTargetsInstruction &&
      actorTargetsInstruction[moveDept] &&
      actorTargetsInstruction[moveDept].length > 0
    ) {
      targets = targets.concat(actorTargetsInstruction[moveDept]);
    }
    if (
      teamTargetsInstruction &&
      teamTargetsInstruction[moveDept] &&
      teamTargetsInstruction[moveDept].length > 0
    ) {
      teamTargets = teamTargets.concat(teamTargetsInstruction[moveDept]);
      teamTargetsInstruction[moveDept].forEach((targetTeam) => {
        targets = targets.concat(targetTeam.actors);
      });
    }
    let moveTargets: Array<any> = [];
    let moveInfo = {
      actor: char,
      targets: moveTargets,
    };
    targets.forEach((aimedBattleActor: BattleActor) => {
      const aimedChar = aimedBattleActor.character;
      const leveDiff = char.level - aimedChar.level;
      const leveDiffOposing = leveDiff * -1;
      const actionMove = MoveBonk;
      const moveExpression = actionMove.defaultExpression;
      const hits: Array<any> = [];

      //add a lot of info in BattleTurnInfo
      //so the event has enough data to work with
      //do moves in the future, for now simple damage
      const stronk = moveExpression.statusInfluence
        .map(
          (influence) =>
            StatCalc.getInfluenceValue(char, char.stats[influence.stat]) *
            influence.influence
        )
        .reduce((prev, current) => prev + current);

      const destronk = moveExpression.resistenceStatus
        .map(
          (influence) =>
            StatCalc.getInfluenceValue(
              aimedChar,
              aimedChar.stats[influence.stat]
            ) * influence.influence
        )
        .reduce((prev, current) => prev + current);
      const hittance = moveExpression.hitStatus
        .map(
          (influence) =>
            StatCalc.getInfluenceValue(char, char.stats[influence.stat]) *
            influence.influence
        )
        .reduce((prev, current) => prev + current);
      const crittance = moveExpression.critStatus
        .map(
          (influence) =>
            StatCalc.getInfluenceValue(char, char.stats[influence.stat]) *
            influence.influence
        )
        .reduce((prev, current) => prev + current);
      const dodgdance = moveExpression.dodgingStatus
        .map(
          (influence) =>
            StatCalc.getInfluenceValue(
              aimedChar,
              aimedChar.stats[influence.stat]
            ) * influence.influence
        )
        .reduce((prev, current) => prev + current);

      let isTotalFumbled = true;
      let isTotalDodged = true;

      let breakLoopOnHitFail = false;
      let successHits = 0;
      let totalEffectiveDamage = 0;
      let isMultiAttack = moveExpression.isMultiAttack;

      //DO HITS
      Array.from({
        length: isMultiAttack ? moveExpression.multiAttackMaxHits : 1,
      }).forEach((_, index) => {
        if (breakLoopOnHitFail) return;

        const isMultiHit = isMultiAttack && successHits > 0;
        const multiAttackPowerOnHitInfluence = isMultiHit
          ? moveExpression.multiAttackPowerOnHitInfluence ** successHits
          : 1;

        const damage =
          (moveExpression.power * multiAttackPowerOnHitInfluence + stronk) *
          (1 + leveDiff / 25) *
          (1 + (25 * Math.random() - 12.5) / 100);
        const reduction = destronk * (1 + leveDiffOposing / 25);
        const calculedDamage = damage - reduction;
        let effectiveDamage = Math.max(calculedDamage, 1);

        const hitChanceBase = moveExpression.hitChance + hittance / 100;
        const multiHitChanceInfluence = isMultiHit
          ? moveExpression.multiAttackHitChanceOnHitInfluence ** successHits
          : 1;
        const hitChanceEffective =
          hitChanceBase * multiHitChanceInfluence - dodgdance / 100;

        const multiHitCriticalChanceInfluence = isMultiHit
          ? moveExpression.multiAttackCriticalChanceOnHitInfluence **
            successHits
          : 1;
        let critChanceEffective =
          moveExpression.criticalChance * multiHitCriticalChanceInfluence +
          crittance / 100;
        let isHit = false;
        let isOverHit = false;

        let isCrit = false;
        let dodgeGoal = Math.random();
        let critGoal = Math.random();
        let critTimes = 0;
        let isFumbled = false;
        let isDodged = false;
        if (dodgeGoal < hitChanceEffective) {
          isHit = true;
          if (hitChanceEffective > 1) {
            const multiHitOverHit = isMultiHit
              ? moveExpression.multiAttackOverHitOnHitInfluence ** successHits
              : 1;

            effectiveDamage +=
              effectiveDamage *
              (moveExpression.overHitInfluence * multiHitOverHit);
            isOverHit = true;
          }
          if (critChanceEffective > 1) {
            const difference = critChanceEffective % 1;
            critTimes = critChanceEffective - difference;
            critChanceEffective = difference;
          }
          if (critGoal < critChanceEffective) {
            critTimes++;
          }
          if (critTimes > 0) {
            isCrit = true;
            const multiHitCrit = isMultiHit
              ? moveExpression.multiAttackCriticalOnHitInfluence ** successHits
              : 1;

            const critMultiplier =
              moveExpression.criticalMultiplier * multiHitCrit * critTimes;
            effectiveDamage *= critMultiplier;
          }
          isTotalFumbled = false;
          isTotalDodged = false;
          successHits++;
          totalEffectiveDamage += effectiveDamage;
        } else {
          if (dodgeGoal < hitChanceBase) {
            isTotalFumbled = false;
            isDodged = true;
          } else {
            isTotalDodged = false;
            isFumbled = true;
          }
        }

        hits.push({
          character: char,
          aimedCharacter: aimedChar,
          leveDiff: leveDiff,
          leveDiffOposing: leveDiffOposing,
          actionMove: actionMove,
          defaultExpression: actionMove.defaultExpression,
          isHit: isHit,
          isOverHit: isOverHit,
          isDodged: isDodged,
          isFumbled: isFumbled,
          isCrit: isCrit,
          critTimes: critTimes,
          critChanceEffective: critChanceEffective,
          effectiveDamage: effectiveDamage,
          dodgeGoal: dodgeGoal,
          critGoal: critGoal,
        });
        if (moveExpression.multiAttackEndOnMiss && (isDodged || isFumbled)) {
          breakLoopOnHitFail = true;
        }
      });

      // GET COST
      let hasCostNotice = false;
      let hasCost = false;
      let hasRecoil = false;
      let costText = '';

      const costs = moveExpression.gaugeCosts;
      hasCostNotice = costs.length > 0;
      let costTaken: { [key in GaugeKey]: number } = {
        MANA: 0,
        STAMINA: 0,
        VITALITY: 0,
      };
      let recoil = 0;

      //DO COST
      if (hasCostNotice) {
        const costTextDMG: Array<string> = [];
        costs.forEach((cost) => {
          const costValue = cost.cost;
          const gauge = char.gauges[cost.gauge];
          const costReduction = cost.costReduction
            .map(
              (influence) =>
                StatCalc.getInfluenceValue(char, char.stats[influence.stat]) *
                influence.influence
            )
            .reduce((prev, current) => prev + current);
          const simpleCost = costValue - costReduction / 10;
          const fumbleDampening = isTotalFumbled
            ? moveExpression.gaugeCostInfluenceOnFumble
            : 1;
          const dodgeDampening = isTotalDodged
            ? moveExpression.gaugeCostInfluenceOnDodge
            : 1;
          const composedCost = simpleCost * fumbleDampening * dodgeDampening;
          let effectiveCost = 0;
          let recoilCost = 0;

          if (GaugeCalc.canHandleValue(composedCost, char, gauge)) {
            effectiveCost = Math.ceil(composedCost);
          } else {
            recoilCost = Math.abs(
              GaugeCalc.getUnhandableValue(composedCost, char, gauge)
            );
            effectiveCost = Math.ceil(composedCost - recoilCost);
          }
          gauge.consumed += effectiveCost;
          char.gauges[GAUGE_KEYS.VITALITY].consumed += recoilCost;

          costTaken[cost.gauge] += effectiveCost;
          recoil += Math.ceil(recoilCost);
          if (effectiveCost > 0 || recoilCost > 0) hasCost = true;
          if (effectiveCost > 0) {
            costTextDMG.push(
              `${effectiveCost}${GAUGE_ABBREVIATION[cost.gauge]}`
            );
          }
        });
        if (recoil > 0) {
          hasRecoil = true;
          costTextDMG.push(
            `${recoil} ${GAUGE_ABBREVIATION[GAUGE_KEYS.VITALITY]} recoil dmg`
          );
        }
        if (costTextDMG.length > 0) {
          costText += ` expending `;
          if (costTextDMG.length == 1) {
            costText += costTextDMG[0];
          } else {
            const lastOne = costTextDMG.pop();
            let tempCostText = costTextDMG.join(', ');
            costText += tempCostText + ' and ' + lastOne;
          }
        }
      }
      //DOCUMENT TURN
      moveInfo.targets.push({
        actor: char,
        aimedChar: aimedChar,
        hasCostNotice: hasCostNotice,
        hasCost: hasCost,
        costTaken: costTaken,
        hasRecoil: hasRecoil,
        recoil: recoil,
        hits: hits,
      });

      let message = `${battle.turn} - ${char.name} used ${moveExpression.name} on ${aimedChar.name}`;
      if (hasCost) {
        message += costText;
      }
      if (isTotalFumbled) {
        message += ` but ${char.name} fumbled.`;
      } else if (isTotalDodged) {
        message += ` but ${aimedChar.name} dodged.`;
      } else if (hits.length == 1) {
        const hit = hits[0];
        aimedChar.gauges[GAUGE_KEYS.VITALITY].consumed += totalEffectiveDamage;
        message += ` causing <${hit.isOverHit ? 'strong' : 'span'} class='${
          hit.isCrit ? 'critical-text' : ''
        }'> ${totalEffectiveDamage.toFixed(0)}dmg`;
        if (hit.isCrit) {
          message += Array.from({ length: hit.critTimes })
            .map((_) => '!')
            .join('');
        } else {
          message += '.';
        }
        message += `</${hit.isOverHit ? 'strong' : 'span'}>`;
      } else {
        message += ` causing `;

        const landedHits = hits.filter((hit) => hit.isHit);
        const fumbles = hits.filter((hit) => hit.isFumbled).length;
        const dodges = hits.filter((hit) => hit.isDodged).length;
        const lastItem = landedHits.length - 1;
        landedHits.forEach((hit, index) => {
          message += `<${hit.isOverHit ? 'strong' : 'span'} class='${
            hit.isCrit ? 'critical-text' : ''
          }'> ${hit.effectiveDamage.toFixed(0)}dmg`;
          if (hit.isCrit) {
            message += Array.from({ length: hit.critTimes })
              .map((_) => '!')
              .join('');
          }
          message += `</${hit.isOverHit ? 'strong' : 'span'}>`;
          if (lastItem != index) message += ', ';
        });
        message += ` Causinga a total of ${totalEffectiveDamage.toFixed(
          0
        )}dmg, landing ${landedHits.length}x`;
        if (fumbles > 0) {
          message += `${dodges > 0 ? ', ' : ' and'} missing ${fumbles}x`;
        }
        if (dodges > 0) {
          message += ` and being avoided ${dodges}x`;
        }
        message += '.';
        aimedChar.gauges[GAUGE_KEYS.VITALITY].consumed += totalEffectiveDamage;
      }

      battle.showHitTakenOnTargetUI();
      battle.writeMessage(message);
    });
    battle.turnInfo.moves.push(moveInfo);
  }
}
