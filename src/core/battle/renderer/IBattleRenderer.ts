import { BattleActionSlot, BattleActor, BattleTeam } from '@/core/battle/types';

export interface IBattleRenderer {
  writeMessage(message: string): void;
  clearMessages(): void;
  setIntroductionMessage(text: string): void;
  clearActionMenu(): void;
  showActionMenu(
    actorName: string,
    options: Array<{ label: string; onSelect: () => void }>
  ): void;
  showTargetSelection(
    targets: BattleActor[],
    onSelectTarget: (target: BattleActor) => void,
    onCancel?: () => void
  ): void;
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
