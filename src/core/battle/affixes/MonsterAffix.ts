import { StatKey } from '@/models/stats';
import { GaugeKey } from '@/models/gauge';

/** Raridade de um modificador. */
export type AffixRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

/** Modificador aplicável a um movimento por um affix. */
export interface MoveModifier {
  moveKey: string;
  /** Multiplicador de power (ex: 1.5 para +50%). */
  powerMultiplier?: number;
  /** Modificador de hitChance (ex: +0.2). */
  hitChanceModifier?: number;
}

/** Bônus de loot concedido por um affix. */
export interface LootBonus {
  xpMultiplier?: number;
  dropChanceMultiplier?: number;
  extraDrops?: string[];
}

/**
 * Modificador procedural de monstro (affix).
 *
 * Exemplos: "Alfa", "Flamejante", "Veloz", "Envenenado".
 * Aplicado durante a geração do monstro para torná-lo único.
 */
export interface MonsterAffix {
  id: string;
  name: string;
  rarity: AffixRarity;
  /** Multiplicadores de stats (ex: { STRENGTH: 1.3 }). */
  statMultipliers?: Partial<Record<StatKey, number>>;
  /** Multiplicadores de gauges (ex: { VITALITY: 1.5 }). */
  gaugeMultipliers?: Partial<Record<GaugeKey, number>>;
  /** Modificadores de movimentos. */
  moveModifiers?: MoveModifier[];
  /** Chaves de passivas concedidas. */
  passiveGrants?: string[];
  /** Bônus de loot ao ser derrotado. */
  lootBonus?: LootBonus;
  /** Descrição para UI. */
  description?: string;
}
