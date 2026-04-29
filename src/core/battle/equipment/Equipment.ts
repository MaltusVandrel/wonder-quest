import { EquipmentSlot } from './EquipmentSlot';
import { StatKey } from '@/models/stats';

/** Modificador de stat aplicado por um equipamento. */
export interface StatModifier {
  stat: StatKey;
  /** Valor fixo (ex: +5) ou multiplicador (ex: 1.2 para +20%). */
  value: number;
  /** Se `true`, `value` é tratado como multiplicador. */
  isMultiplier?: boolean;
}

/** Item equipável com influências em stats e habilidades. */
export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  /** Modificadores de stats aplicados enquanto equipado. */
  statModifiers: StatModifier[];
  /** Chaves de movimentos concedidos pelo equipamento (ex: 'sword_slash'). */
  moveGrants?: string[];
  /** Chaves de passivas concedidas pelo equipamento. */
  passiveGrants?: string[];
  /** Descrição para UI. */
  description?: string;
}

/** Conjunto de equipamentos de um ator. */
export type ActorEquipment = Partial<Record<EquipmentSlot, Equipment>>;
