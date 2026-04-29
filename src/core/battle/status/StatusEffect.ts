import { BattleActor } from '@/core/battle/types';
import { HitResult } from '@/core/battle/combat/HitResult';

/** Tags para classificação de efeitos de status. */
export type StatusTag =
  | 'POISON'
  | 'BURN'
  | 'FREEZE'
  | 'PARALYZE'
  | 'BUFF_STRENGTH'
  | 'BUFF_SPEED'
  | 'DEBUFF_DEFENSE'
  | 'DEBUFF_SPEED'
  | 'REGEN'
  | 'SHIELD'
  | 'FLINCH'
  | 'WRAP'
  | 'CUSTOM';

/** Contexto disponível para callbacks de status effect. */
export interface StatusContext {
  /** Efeito sendo processado. */
  effect: StatusEffect;
  /** Ator que possui o efeito. */
  target: BattleActor;
  /** Ator que aplicou o efeito (pode ser igual ao target). */
  source: BattleActor;
  /** Estado da batalha (opaque — usar via helpers). */
  battleState: unknown;
}

/**
 * Efeito de status duradouro em um ator de batalha.
 *
 * Conecta-se ao pipeline de fases via `StatusEffectManager`,
 * que registra listeners em:
 *   - BEFORE_STATUS_RESOLVE → ON_STATUS_RESOLVE → AFTER_STATUS_RESOLVE
 */
export interface StatusEffect {
  id: string;
  name: string;
  source: BattleActor;
  target: BattleActor;
  /** Turnos restantes. `-1` para efeitos permanentes. */
  duration: number;
  /** Quantidade de stacks acumulados. */
  stacks: number;
  /** Tags para filtragem e interação com outros sistemas. */
  tags: StatusTag[];
  /** Chamado quando o efeito é aplicado pela primeira vez. */
  onApply?: (ctx: StatusContext) => void;
  /** Chamado no início de cada turno do alvo. */
  onTurnStart?: (ctx: StatusContext) => void;
  /** Chamado no final de cada turno do alvo. */
  onTurnEnd?: (ctx: StatusContext) => void;
  /** Chamado antes de um hit ser processado no alvo. */
  onBeforeHit?: (ctx: StatusContext, hit: HitResult) => void;
  /** Chamado após um hit ser processado no alvo. */
  onAfterHit?: (ctx: StatusContext, hit: HitResult) => void;
  /** Chamado quando o efeito expira ou é removido. */
  onRemove?: (ctx: StatusContext) => void;
}
