import { BattleActor } from '@/core/battle/types';
import { HitResult } from '@/core/battle/combat/HitResult';

/** Gatilhos disponíveis para habilidades passivas. */
export type PassiveTrigger =
  | 'ON_HIT_TAKEN'
  | 'ON_HIT_DEALT'
  | 'ON_HEALTH_BELOW'
  | 'ON_TURN_START'
  | 'ON_TURN_END'
  | 'ON_BATTLE_START'
  | 'ON_BATTLE_END'
  | 'ON_STATUS_APPLIED'
  | 'ON_STATUS_REMOVED'
  | 'ON_MOVE_EXECUTED'
  | 'ON_CRIT_DEALT'
  | 'ON_DODGE'
  | 'ON_KILL'
  | 'CUSTOM';

/** Contexto disponível para callbacks de passivas. */
export interface PassiveContext {
  /** Ator que possui a passiva. */
  owner: BattleActor;
  /** Estado da batalha (opaque — usar via helpers). */
  battleState: unknown;
  /** Hit relacionado ao gatilho, se aplicável. */
  hit?: HitResult;
  /** Valor customizado para gatilhos com threshold (ex: ON_HEALTH_BELOW). */
  thresholdValue?: number;
}

/**
 * Habilidade passiva que reage a eventos da batalha.
 *
 * Conecta-se ao `BattleEventBus` via `PassiveManager`,
 * que registra listeners nas fases relevantes ao gatilho.
 */
export interface PassiveAbility {
  id: string;
  name: string;
  trigger: PassiveTrigger;
  /** Condição adicional que deve ser satisfeita para a passiva ativar. */
  condition?: (ctx: PassiveContext) => boolean;
  /** Efeito executado quando a passiva ativa. */
  effect: (ctx: PassiveContext) => void;
  /** Descrição para UI. */
  description?: string;
}
