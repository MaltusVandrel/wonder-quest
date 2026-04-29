import { Actor } from '@/models/actor';
import {
  BattleActor,
  BattleContext,
  BattleInstructionExpression,
  BattleTeam,
} from './battle-context';
import { MoveExpression } from '@/models/move';
import { GAUGE_KEYS } from '@/models/gauge';
import { executeMove } from '@/core/battle/combat/MoveEngine';

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

    const moveInfo = {
      actor: char,
      targets: [] as Array<{
        actor: Actor;
        aimedChar: Actor;
        hits: ReturnType<typeof executeMove>['hits'];
      }>,
    };

    targets.forEach((aimedBattleActor: BattleActor) => {
      const result = executeMove(move, char, aimedBattleActor.character);

      result.hits.forEach((hit) => {
        const hitDmg = hit.value;
        const message = `${char.name} ${hit.action} ${aimedBattleActor.character.name} for ${hitDmg}dmg`;
        aimedBattleActor.character.gauges[GAUGE_KEYS.VITALITY].consumed += hitDmg;
        battle.showHitTakenOnTargetUI();
        battle.writeMessage(message);
      });

      moveInfo.targets.push({
        actor: char,
        aimedChar: aimedBattleActor.character,
        hits: result.hits,
      });
    });

    battle.turnInfo.moves.push(moveInfo);
  }
}
