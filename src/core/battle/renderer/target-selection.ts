import type { BattleActor, BattleTeam } from '@/core/battle/types';

export type TargetSelectionMode = 'actor' | 'team' | 'mixed';

export interface TargetSelectionConfig {
  /** Modo de seleção: ator individual, time inteiro, ou misto */
  mode: TargetSelectionMode;
  /** Atores disponíveis para seleção */
  availableActors: BattleActor[];
  /** Times disponíveis para seleção (quando mode é 'team' ou 'mixed') */
  availableTeams?: BattleTeam[];
  /** Quantidade mínima de alvos que devem ser selecionados */
  minTargets: number;
  /** Quantidade máxima de alvos que podem ser selecionados */
  maxTargets: number;
  /** Texto descritivo do movimento (ex: "Ataque", "Magia de Cura") */
  moveName?: string;
  /** Callback quando a seleção é confirmada */
  onConfirm: (selectedActors: BattleActor[], selectedTeams: BattleTeam[]) => void;
  /** Callback quando o jogador cancela a seleção */
  onCancel?: () => void;
}
