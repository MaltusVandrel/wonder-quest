import { BattleInstructionStrategy } from '../BattleInstructionStrategy';
import { BattleState } from '@/core/battle/state/BattleState';
import {
  BattleActor,
  BattleActionType,
  BattleInstructionExpression,
  BattleTeam,
} from '@/core/battle/types';
import { MoveBonk } from '@/models/move';

export const GetRandomAliveAdversaryStrategy: BattleInstructionStrategy = {
  key: 'GET_RANDOM_ALIVE_ADVERSARY',
  name: 'Get Random Alive Adversary',
  execute(state: BattleState, self: BattleActor): BattleInstructionExpression {
    const team = self.team;
    const enemyTeams: BattleTeam[] = state.getEnemyTeams(team);
    const adversarialTeams: BattleTeam[] = state.getAdversarialTeams(team);
    const detrimentalTeams: BattleTeam[] = state.getDetrimentalTeams(team);

    let aimedTeam: BattleTeam | undefined;
    const teamClusters: Array<Array<BattleTeam>> = [enemyTeams, adversarialTeams, detrimentalTeams];
    for (const teamCluster of teamClusters) {
      const possibleAimedTeams = state.getTeamsWithAliveActors(teamCluster);
      const possibleAimedTeam =
        possibleAimedTeams[Math.floor(possibleAimedTeams.length * Math.random())];
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

    const aliveAimedBattleActors = aimedTeam.actors.filter(
      (actor: BattleActor) => !actor.character.isFainted()
    );

    const aimedBattleActor =
      aliveAimedBattleActors[Math.floor(aliveAimedBattleActors.length * Math.random())];

    return {
      actionType: BattleActionType.ATTACK,
      move: MoveBonk.defaultExpression,
      actorTargets: [[aimedBattleActor]],
    };
  },
};
