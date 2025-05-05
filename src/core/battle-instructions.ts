import { MoveBonk } from 'src/models/move';
import {
  BattleActionSlot,
  BattleActionType,
  BattleActor,
  BattleContext,
  BattleInstruction,
  BattleInstructionExpression,
  BattleTeam,
} from './battle-context';

export const BATTLE_INSTRUCTIONS = {
  GET_RANDOM_ALIVE_ADVERSARY: function (
    battle: BattleContext,
    self: BattleActor
  ): BattleInstructionExpression {
    //{   actionType: BattleActionType; move?: MoveExpression;     targets: Array<Array<BattleTeam | BattleActor | BattleActionSlot>>;  }
    const team = self.team;
    const alliesTeam: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
      )
      .map((rel) => rel.team);

    const enemyTeams: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
      )
      .sort((relA, relB) => relB.behaviour - relA.behaviour)
      .map((rel) => rel.team);

    const aimedTeam = enemyTeams[0];

    //add some Relevant Decision Making RDM in future, for now, get random
    const aliveAimedBattleActors = aimedTeam.actors.filter(
      (actor: BattleActor) => !actor.character.isFainted()
    );
    const aimedBattleActor =
      aliveAimedBattleActors[
        Math.floor(aliveAimedBattleActors.length * Math.random())
      ];

    battle.turnInfo.aimedActor = aimedBattleActor;

    const aimedChar = aimedBattleActor.character;
    return {
      actionType: BattleActionType.ATTACK,
      move: MoveBonk.defaultExpression,
      actorTargets: [[aimedBattleActor]],
    };
  },
};
