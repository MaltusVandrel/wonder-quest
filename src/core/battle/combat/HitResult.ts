/** Resultado individual de um hit de movimento. */
export interface HitResult {
  /** Tipo de ação (ex: 'hit', 'heal', 'miss', 'crit'). */
  action: string;
  /** Valor bruto calculado pelo movimento. */
  rawValue: number;
  /** Valor final após aplicação do pipeline de dano. */
  finalValue: number;
  /** Se o hit foi um acerto crítico. */
  isCritical?: boolean;
  /** Se o hit foi esquivado. */
  isDodged?: boolean;
  /** Propriedades associadas ao hit (ex: elementos, tipos de dano). */
  properties?: string[];
}
