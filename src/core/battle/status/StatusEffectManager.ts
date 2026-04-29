import { BattleActor } from '@/core/battle/types';
import { BattleEventBus } from '@/core/battle/state/BattleEventBus';
import { BattlePhase } from '@/core/battle/types';
import { StatusEffect, StatusContext } from './StatusEffect';

/**
 * Gerenciador de efeitos de status.
 *
 * Responsável por manter o registro de efeitos ativos e
 * conectá-los ao `BattleEventBus` nas fases apropriadas.
 *
 * Será integrado ao `BattleState` no futuro.
 */
export class StatusEffectManager {
  private effects = new Map<BattleActor, StatusEffect[]>();

  /** Registra um efeito em um ator. */
  apply(effect: StatusEffect): void {
    const list = this.effects.get(effect.target) ?? [];
    list.push(effect);
    this.effects.set(effect.target, list);
    if (effect.onApply) {
      effect.onApply(this.buildContext(effect));
    }
  }

  /** Remove um efeito específico. */
  remove(effect: StatusEffect): void {
    const list = this.effects.get(effect.target);
    if (!list) return;
    const index = list.indexOf(effect);
    if (index !== -1) {
      list.splice(index, 1);
      if (effect.onRemove) {
        effect.onRemove(this.buildContext(effect));
      }
    }
  }

  /** Retorna todos os efeitos ativos de um ator. */
  getEffects(actor: BattleActor): StatusEffect[] {
    return this.effects.get(actor) ?? [];
  }

  /** Registra listeners no barramento de eventos. */
  bindToEventBus(bus: BattleEventBus): void {
    bus.on(BattlePhase.BEFORE_STATUS_RESOLVE, async () => {
      // TODO: ordenar efeitos por prioridade, aplicar decay de duration
    });
    bus.on(BattlePhase.ON_STATUS_RESOLVE, async () => {
      // TODO: executar onTurnStart/onTurnEnd dos efeitos
    });
    bus.on(BattlePhase.AFTER_STATUS_RESOLVE, async () => {
      // TODO: remover efeitos com duration = 0
    });
  }

  private buildContext(effect: StatusEffect): StatusContext {
    return {
      effect,
      target: effect.target,
      source: effect.source,
      battleState: null, // será preenchido quando integrado ao BattleState
    };
  }
}
