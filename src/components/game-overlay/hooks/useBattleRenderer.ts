import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  BattleActionSlot,
  BattleActor,
  BattleTeam,
} from '@/core/battle/types';
import type { IBattleRenderer } from '@/core/battle/renderer/IBattleRenderer';
import type { TargetSelectionConfig } from '@/core/battle/renderer/target-selection';

export interface BattleActionMenuOption {
  label: string;
  onSelect: () => void;
}

export interface BattleTargetSelectionState {
  config: TargetSelectionConfig;
  selectedActors: BattleActor[];
  selectedTeams: BattleTeam[];
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
  targetSelection: BattleTargetSelectionState | null;
}

function toNameKey(name: string): string {
  return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
}

const initialState: BattleUIState = {
  messages: [],
  actionSlots: [],
  teams: [],
  retreatedTeams: [],
  actionMenu: null,
  targetSelection: null,
};

export interface BattleRendererAPI {
  state: BattleUIState;
  renderer: IBattleRenderer;
  /** Ativa/desativa o renderer. Chamadas de BattleContext antigos são ignoradas quando inativo. */
  setActive: (active: boolean) => void;
  toggleActorSelection: (actor: BattleActor) => void;
  toggleTeamSelection: (team: BattleTeam) => void;
  confirmTargetSelection: () => void;
  cancelTargetSelection: () => void;
}

/**
 * Hook que implementa IBattleRenderer via estado React.
 * Retorna o estado atual da UI de batalha, um objeto renderer
 * que pode ser injetado no BattleContext, e helpers para
 * manipular a seleção interativa de alvos.
 */
export function useBattleRenderer(): BattleRendererAPI {
  const [state, setState] = useState<BattleUIState>(initialState);
  const isActiveRef = useRef(true);

  const guard = useCallback(<T extends (...args: any[]) => void>(fn: T): T => {
    return ((...args: Parameters<T>) => {
      if (!isActiveRef.current) return;
      fn(...args);
    }) as T;
  }, []);

  const renderer = useMemo<IBattleRenderer>(
    () => ({
      writeMessage: guard((message: string) => {
        setState((prev) => ({
          ...prev,
          messages: [message, ...prev.messages],
        }));
      }),

      clearMessages: guard(() => {
        setState((prev) => ({ ...prev, messages: [] }));
      }),

      setIntroductionMessage: guard((text: string) => {
        setState((prev) => ({ ...prev, messages: [text] }));
      }),

      clearActionMenu: guard(() => {
        setState((prev) => ({
          ...prev,
          actionMenu: null,
          targetSelection: null,
        }));
      }),

      showActionMenu: guard((actorName: string, options: BattleActionMenuOption[]) => {
        setState((prev) => ({
          ...prev,
          actionMenu: { actorName, options },
          targetSelection: null,
        }));
      }),

      startTargetSelection: guard((config: TargetSelectionConfig) => {
        setState((prev) => ({
          ...prev,
          actionMenu: null,
          targetSelection: {
            config,
            selectedActors: [],
            selectedTeams: [],
          },
        }));
      }),

      cancelTargetSelection: guard(() => {
        setState((prev) => {
          const ts = prev.targetSelection;
          return { ...prev, targetSelection: null };
        });
      }),

      actionSlotToElementUI: guard((actionSlot: BattleActionSlot) => {
        setState((prev) => ({
          ...prev,
          actionSlots: [...prev.actionSlots, actionSlot],
        }));
      }),

      setOrderActionListUI: guard(() => {
        setState((prev) => ({ ...prev }));
      }),

      clearOrderPanel: guard(() => {
        setState((prev) => ({ ...prev, actionSlots: [] }));
      }),

      removeActionSlotById: guard((id: string) => {
        setState((prev) => ({
          ...prev,
          actionSlots: prev.actionSlots.filter((slot) => slot.id !== id),
        }));
      }),

      removeActionFromUI: guard((actionSlot: BattleActionSlot) => {
        setState((prev) => ({
          ...prev,
          actionSlots: prev.actionSlots.filter((slot) => slot.id !== actionSlot.id),
        }));
      }),

      removeActorSlotsFromUI: guard((actor: BattleActor) => {
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
      }),

      updateTeamInfoUI: guard((teams: BattleTeam[], retreatedTeams: BattleTeam[]) => {
        setState((prev) => ({
          ...prev,
          teams,
          retreatedTeams,
        }));
      }),

      clearTeamPanels: guard(() => {
        setState((prev) => ({ ...prev, teams: [], retreatedTeams: [] }));
      }),

      showHitTakenOnTargetUI: guard(() => {
        // TODO: implementar feedback visual de dano no modelo React
      }),
    }),
    [guard]
  );

  const toggleActorSelection = useCallback((actor: BattleActor) => {
    setState((prev) => {
      const ts = prev.targetSelection;
      if (!ts) return prev;
      const { config, selectedActors, selectedTeams } = ts;
      const totalSelected = selectedActors.length + selectedTeams.length;
      const alreadySelected = selectedActors.some(
        (a) => a.character.id === actor.character.id
      );

      // Nota: a verificação de availableActors é feita visualmente no BattleDialog.
      // Qualquer clique em um ator durante a seleção é processado;
      // se o ator não estiver em availableActors, ele simplesmente não terá
      // efeito visual além do toggle local (que será ignorado pelo BattleContext
      // pois o onConfirm só recebe os selecionados).
      // Para garantir funcionamento, removemos a verificação restritiva aqui.

      if (alreadySelected) {
        return {
          ...prev,
          targetSelection: {
            ...ts,
            selectedActors: selectedActors.filter(
              (a) => a.character.id !== actor.character.id
            ),
          },
        };
      }

      if (totalSelected >= config.maxTargets) {
        return prev;
      }

      return {
        ...prev,
        targetSelection: {
          ...ts,
          selectedActors: [...selectedActors, actor],
        },
      };
    });
  }, []);

  const toggleTeamSelection = useCallback((team: BattleTeam) => {
    setState((prev) => {
      const ts = prev.targetSelection;
      if (!ts) return prev;
      const { config, selectedActors, selectedTeams } = ts;
      const totalSelected = selectedActors.length + selectedTeams.length;
      const alreadySelected = selectedTeams.some(
        (t) => t === team || t.id === team.id
      );

      // Nota: a verificação de availableTeams é feita visualmente no BattleDialog.
      // Qualquer clique em um time durante a seleção é processado.

      if (alreadySelected) {
        return {
          ...prev,
          targetSelection: {
            ...ts,
            selectedTeams: selectedTeams.filter(
              (t) => !(t === team || t.id === team.id)
            ),
          },
        };
      }

      if (totalSelected >= config.maxTargets) {
        return prev;
      }

      return {
        ...prev,
        targetSelection: {
          ...ts,
          selectedTeams: [...selectedTeams, team],
        },
      };
    });
  }, []);

  const confirmTargetSelection = useCallback(() => {
    setState((prev) => {
      const ts = prev.targetSelection;
      if (!ts) return prev;
      const { config, selectedActors, selectedTeams } = ts;
      const totalSelected = selectedActors.length + selectedTeams.length;

      if (totalSelected < config.minTargets) {
        return prev;
      }

      const actors = [...selectedActors];
      const teams = [...selectedTeams];

      // Chama onConfirm DEPOIS de atualizar o estado para evitar
      // re-entrada de setState durante o updater
      Promise.resolve().then(() => {
        config.onConfirm(actors, teams);
      });

      return { ...prev, targetSelection: null };
    });
  }, []);

  const cancelTargetSelection = useCallback(() => {
    setState((prev) => {
      const ts = prev.targetSelection;
      const onCancel = ts?.config.onCancel;

      if (onCancel) {
        // Chama onCancel DEPOIS de limpar o estado para evitar
        // re-entrada de setState durante o updater
        Promise.resolve().then(() => {
          onCancel();
        });
      }
      return { ...prev, targetSelection: null };
    });
  }, []);

  const setActive = useCallback((active: boolean) => {
    isActiveRef.current = active;
  }, []);

  return {
    state,
    renderer,
    setActive,
    toggleActorSelection,
    toggleTeamSelection,
    confirmTargetSelection,
    cancelTargetSelection,
  };
}

export { toNameKey };

/** Verifica se um ator está selecionado no estado atual */
export function isActorSelected(state: BattleUIState, actor: BattleActor): boolean {
  const ts = state.targetSelection;
  if (!ts) return false;
  return ts.selectedActors.some((a) => a.character.id === actor.character.id);
}

/** Verifica se um time está selecionado no estado atual */
export function isTeamSelected(state: BattleUIState, team: BattleTeam): boolean {
  const ts = state.targetSelection;
  if (!ts) return false;
  return ts.selectedTeams.some((t) => t.id === team.id);
}

/** Verifica se um ator é selecionável no contexto atual */
export function isActorSelectable(state: BattleUIState, actor: BattleActor): boolean {
  const ts = state.targetSelection;
  if (!ts) return false;
  const { mode, availableActors } = ts.config;
  if (mode === 'team') return false;
  // Tenta por referência, depois por character.id
  return (
    availableActors.some((a) => a === actor) ||
    availableActors.some((a) => a.character.id === actor.character.id)
  );
}

/** Verifica se um time é selecionável no contexto atual */
export function isTeamSelectable(state: BattleUIState, team: BattleTeam): boolean {
  const ts = state.targetSelection;
  if (!ts) return false;
  const { mode, availableTeams } = ts.config;
  if (mode === 'actor') return false;
  return availableTeams?.some((t) => t === team || t.id === team.id) ?? false;
}

/** Retorna o total de alvos já selecionados */
export function selectedCount(state: BattleUIState): number {
  const ts = state.targetSelection;
  if (!ts) return 0;
  return ts.selectedActors.length + ts.selectedTeams.length;
}
