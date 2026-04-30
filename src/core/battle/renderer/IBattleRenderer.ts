import { BattleActionSlot, BattleActor, BattleTeam } from '@/core/battle/types';
import type { TargetSelectionConfig } from './target-selection';

export interface IBattleRenderer {
  writeMessage(message: string): void;
  clearMessages(): void;
  setIntroductionMessage(text: string): void;
  clearActionMenu(): void;
  showActionMenu(
    actorName: string,
    options: Array<{ label: string; onSelect: () => void }>
  ): void;
  /** @deprecated use startTargetSelection */
  showTargetSelection?(
    targets: BattleActor[],
    onSelectTarget: (target: BattleActor) => void,
    onCancel?: () => void
  ): void;
  /** Inicia o modo interativo de seleção de alvos no painel de times */
  startTargetSelection(config: TargetSelectionConfig): void;
  /** Cancela a seleção de alvos atual */
  cancelTargetSelection(): void;
  actionSlotToElementUI(actionSlot: BattleActionSlot): void;
  setOrderActionListUI(): void;
  clearOrderPanel(): void;
  removeActionSlotById(id: string): void;
  removeActionFromUI(actionSlot: BattleActionSlot): void;
  removeActorSlotsFromUI(actor: BattleActor): void;
  updateTeamInfoUI(teams: BattleTeam[], retreatedTeams: BattleTeam[]): void;
  clearTeamPanels(): void;
  showHitTakenOnTargetUI(): void;
}
