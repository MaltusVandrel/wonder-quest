import { BattleActor } from '@/core/battle/types';
import { BattleEventBus } from '@/core/battle/state/BattleEventBus';
import { PassiveAbility, PassiveContext } from './PassiveAbility';

/**
 * Gerenciador de passivas em batalha.
 *
 * Responsável por registrar as passivas de cada ator no `BattleEventBus`
 * quando a batalha inicia, e removê-las ao fim.
 */
export class PassiveManager {
  private unsubscribeFns: (() => void)[] = [];

  /** Registra todas as passivas de um ator no barramento. */
  registerActorPassives(actor: BattleActor, passives: PassiveAbility[], bus: BattleEventBus): void {
    for (const passive of passives) {
      // Mapeamento de trigger → BattlePhase (simplificado)
      // TODO: expandir para todos os gatilhos
      const fn = async (payload: unknown) => {
        const ctx: PassiveContext = {
          owner: actor,
          battleState: payload,
        };
        if (!passive.condition || passive.condition(ctx)) {
          passive.effect(ctx);
        }
      };
      // Placeholder: registra em ON_ACTION_EXECUTE como exemplo
      const unsub = bus.on('on-action-execute' as any, fn, 0);
      this.unsubscribeFns.push(unsub);
    }
  }

  /** Remove todos os listeners registrados. */
  clear(): void {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
  }
}
