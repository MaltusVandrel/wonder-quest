import { BattleActor } from '@/core/battle/types';
import { BattleState } from '@/core/battle/state/BattleState';
import { BattleInstructionExpression } from '@/core/battle/types';

/** Estratégia de instrução de batalha — define o comportamento de IA de um ator. */
export interface BattleInstructionStrategy {
  /** Identificador único da estratégia (ex: 'GET_RANDOM_ALIVE_ADVERSARY'). */
  readonly key: string;
  /** Nome legível da estratégia. */
  readonly name: string;
  /** Executa a estratégia e retorna a expressão de ação. */
  execute(state: BattleState, self: BattleActor): BattleInstructionExpression;
}
