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
    const alliesTeam: Array<BattleTeam> = battle.getAllyTeams(team);

    const enemyTeams: Array<BattleTeam> = battle.getEnemyTeams(team);

    const adversarialTeams: BattleTeam[] = battle.getAdversarialTeams(team);

    const detrimentalTeams: BattleTeam[] = battle.getDetrimentalTeams(team);

    const supportiveTeams: BattleTeam[] = battle.getSupportiveTeams(team);

    const beneficialTeams: BattleTeam[] = battle.getBeneficialTeams(team);

    let aimedTeam: BattleTeam | undefined;
    const teamClusters: Array<Array<BattleTeam>> = [
      enemyTeams,
      adversarialTeams,
      detrimentalTeams,
    ];
    for (const teamCluster of teamClusters) {
      const possibleAimedTeams = battle.getTeamsWithAliveActors(teamCluster);
      const possibleAimedTeam =
        possibleAimedTeams[
          Math.floor(possibleAimedTeams.length * Math.random())
        ];
      if (possibleAimedTeam) {
        aimedTeam = possibleAimedTeam;
        break;
      }
    }

    if (!aimedTeam) {
      return {
        actionType: BattleActionType.WAIT,
        actorTargets: [],
      };
    }

    let aliveAimedBattleActors = [];
    try {
      //add some Relevant Decision Making RDM in future, for now, get random
      aliveAimedBattleActors = aimedTeam.actors.filter(
        (actor: BattleActor) => !actor.character.isFainted()
      );
    } catch (e) {
      const theresEnemiesAlive = battle.isThereAnyAdversaryAlive(team);
      throw e;
    }
    const aimedBattleActor =
      aliveAimedBattleActors[
        Math.floor(aliveAimedBattleActors.length * Math.random())
      ];
    try {
      battle.turnInfo.aimedActor = aimedBattleActor;
    } catch (e) {
      throw e;
    }
    return {
      actionType: BattleActionType.ATTACK,
      move: MoveBonk.defaultExpression,
      actorTargets: [[aimedBattleActor]],
    };
  },
};
