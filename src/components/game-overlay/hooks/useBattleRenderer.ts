import { useCallback, useMemo, useReducer, useRef } from 'react';
import type {
  BattleActionSlot,
  BattleActor,
  BattleTeam,
} from '@/core/battle/types';
import type { IBattleRenderer } from '@/core/battle/renderer/IBattleRenderer';
import { GaugeCalc } from '@/models/gauge';

export interface BattleActionMenuOption {
  label: string;
  onSelect: () => void;
}

export interface BattleTargetSelection {
  targets: BattleActor[];
  onSelectTarget: (target: BattleActor) => void;
  onCancel?: () => void;
}

export interface BattleUIState {
  messages: string[];
  actionSlots: BattleActionSlot[];
  teams: BattleTeam[];
  retreatedTeams: BattleTeam[];
  actionMenu: {
    actorName: string;
    options: BattleActionMenuOption[];
  } | null;
  targetSelection: BattleTargetSelection | null;
}

function toNameKey(name: string): string {
  return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
}

/**
 * Hook que implementa IBattleRenderer via estado React.
 * Retorna o estado atual da UI de batalha e um objeto renderer
 * que pode ser injetado no BattleContext.
 */
export function useBattleRenderer(): {
  state: BattleUIState;
  renderer: IBattleRenderer;
} {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const stateRef = useRef<BattleUIState>({
    messages: [],
    actionSlots: [],
    teams: [],
    retreatedTeams: [],
    actionMenu: null,
    targetSelection: null,
  });

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (updater: (prev: BattleUIState) => BattleUIState) => {
      stateRef.current = updater(stateRef.current);
      forceUpdate();
    },
    []
  );

  const renderer = useMemo<IBattleRenderer>(
    () => ({
      writeMessage(message: string) {
        setState((prev) => ({
          ...prev,
          messages: [message, ...prev.messages],
        }));
      },

      clearMessages() {
        setState((prev) => ({ ...prev, messages: [] }));
      },

      setIntroductionMessage(text: string) {
        setState((prev) => ({ ...prev, messages: [text] }));
      },

      clearActionMenu() {
        setState((prev) => ({
          ...prev,
          actionMenu: null,
          targetSelection: null,
        }));
      },

      showActionMenu(actorName: string, options: BattleActionMenuOption[]) {
        setState((prev) => ({
          ...prev,
          actionMenu: { actorName, options },
          targetSelection: null,
        }));
      },

      showTargetSelection(
        targets: BattleActor[],
        onSelectTarget: (target: BattleActor) => void,
        onCancel?: () => void
      ) {
        setState((prev) => ({
          ...prev,
          actionMenu: null,
          targetSelection: { targets, onSelectTarget, onCancel },
        }));
      },

      actionSlotToElementUI(actionSlot: BattleActionSlot) {
        setState((prev) => ({
          ...prev,
          actionSlots: [...prev.actionSlots, actionSlot],
        }));
      },

      setOrderActionListUI() {
        // No modelo React os slots já estão ordenados no array;
        // a visualização limita a 15 itens no render.
        forceUpdate();
      },

      clearOrderPanel() {
        setState((prev) => ({ ...prev, actionSlots: [] }));
      },

      removeActionSlotById(id: string) {
        setState((prev) => ({
          ...prev,
          actionSlots: prev.actionSlots.filter((slot) => slot.id !== id),
        }));
      },

      removeActionFromUI(actionSlot: BattleActionSlot) {
        setState((prev) => ({
          ...prev,
          actionSlots: prev.actionSlots.filter((slot) => slot.id !== actionSlot.id),
        }));
      },

      removeActorSlotsFromUI(actor: BattleActor) {
        const className = `turn-slot-${toNameKey(actor.team.name)}-${toNameKey(actor.character.name)}`;
        setState((prev) => ({
          ...prev,
          actionSlots: prev.actionSlots.filter(
            (slot) =>
              !(
                slot.battleActor.team.name === actor.team.name &&
                slot.battleActor.character.name === actor.character.name
              )
          ),
        }));
      },

      updateTeamInfoUI(teams: BattleTeam[], retreatedTeams: BattleTeam[]) {
        setState((prev) => ({
          ...prev,
          teams,
          retreatedTeams,
        }));
      },

      clearTeamPanels() {
        setState((prev) => ({ ...prev, teams: [], retreatedTeams: [] }));
      },

      showHitTakenOnTargetUI() {
        // TODO: implementar feedback visual de dano no modelo React
      },
    }),
    [setState]
  );

  return { state: getState(), renderer };
}
