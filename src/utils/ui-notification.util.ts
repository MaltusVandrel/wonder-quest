import { store } from '@/store';
import { addToast, addDialog } from '@/store/slices/uiSlice';
import { DIALOG_TYPES } from '@/types/dialog';
import { Encounter, GameActionResult } from '@/data/bank/encounter';

export { DIALOG_TYPES };

export function showToast(data: Encounter) {
  store.dispatch(addToast(data));
}

export function showDialog<T>(data: T, type: DIALOG_TYPES) {
  store.dispatch(addDialog({ type, data }));
}

export function showEncounterDialog(data: Encounter) {
  store.dispatch(addDialog({ type: DIALOG_TYPES.ENCOUNTER, data }));
}

export function showGameActionResultDialog(data: GameActionResult) {
  store.dispatch(addDialog({ type: DIALOG_TYPES.GAME_ACTION_RESULT, data }));
}

export function showAlertDialog(data: string) {
  store.dispatch(addDialog({ type: DIALOG_TYPES.ALERT, data }));
}

export function showCompanyDialog(data?: unknown) {
  store.dispatch(addDialog({ type: DIALOG_TYPES.COMPANY, data }));
}
