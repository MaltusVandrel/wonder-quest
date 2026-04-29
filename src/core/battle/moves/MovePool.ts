import { MoveExpression } from '@/models/move';

/**
 * Entrada no pool de movimentos de um ator.
 *
 * Cada ator carrega um conjunto de movimentos que podem ser
 * usados em batalha. Movimentos melhoram com o uso (mastery).
 */
export interface MovePoolEntry {
  moveKey: string;
  expression: MoveExpression;
  /** Quantidade de vezes que o movimento foi usado. */
  usageCount: number;
  /** Nível de maestria (0–3). */
  masteryLevel: number;
  /** Branches desbloqueados com a maestria. */
  unlockedBranches: string[];
}

/** Pool completo de movimentos de um ator. */
export type MovePool = MovePoolEntry[];
