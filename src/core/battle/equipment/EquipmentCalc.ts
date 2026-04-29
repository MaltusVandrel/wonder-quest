import { Actor } from '@/models/actor';
import { StatKey } from '@/models/stats';
import { ActorEquipment, StatModifier } from './Equipment';

/**
 * Calculadora de influências de equipamento.
 *
 * Aplica `statModifiers` dos equipamentos sobre os stats base do ator.
 * Será integrada em `StatCalc.getCurrentValue()` no futuro.
 */
export class EquipmentCalc {
  static applyModifiers(actor: Actor, equipment: ActorEquipment): Record<StatKey, number> {
    const modifiers: Record<string, number> = {};

    Object.values(equipment).forEach((item) => {
      if (!item) return;
      item.statModifiers.forEach((mod) => {
        const key = mod.stat;
        if (mod.isMultiplier) {
          modifiers[key] = (modifiers[key] ?? 1) * mod.value;
        } else {
          modifiers[key] = (modifiers[key] ?? 0) + mod.value;
        }
      });
    });

    return modifiers as Record<StatKey, number>;
  }
}
