/**
 * Progressão de maestria de um movimento.
 *
 * Define quanto XP é ganho por uso e quais thresholds
 * desbloqueiam novos branches ou efeitos.
 */
export interface MoveProgression {
  /** XP ganho a cada uso do movimento. */
  xpPerUse: number;
  /** Thresholds de XP para cada nível de maestria (1, 2, 3). */
  thresholds: [number, number, number];
  /** Branches desbloqueados ao atingir cada nível de maestria. */
  branchUnlocks: Record<number, string[]>;
  /** Efeitos adicionais desbloqueados por nível. */
  bonusEffects?: Record<number, string[]>;
}
