import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Encounter } from '@/data/bank/encounter';
import { DIALOG_TYPES } from '@/types/dialog';

export interface ToastItem {
  id: string;
  encounter: Encounter;
  count: number;
  createdAt: number;
}

export interface DialogItem {
  id: string;
  type: DIALOG_TYPES;
  data: unknown;
}

interface UIState {
  toasts: ToastItem[];
  dialogs: DialogItem[];
}

const initialState: UIState = {
  toasts: [],
  dialogs: [],
};

let toastIdCounter = 0;
let dialogIdCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<Encounter>) {
      const encounter = action.payload;
      const existing = state.toasts.find((t) => t.encounter.key === encounter.key);
      if (existing) {
        existing.count++;
        existing.createdAt = Date.now();
      } else {
        toastIdCounter++;
        state.toasts.push({
          id: `toast-${toastIdCounter}`,
          encounter,
          count: 1,
          createdAt: Date.now(),
        });
      }
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    addDialog(state, action: PayloadAction<{ type: DIALOG_TYPES; data: unknown }>) {
      dialogIdCounter++;
      state.dialogs.push({
        id: `dialog-${dialogIdCounter}`,
        type: action.payload.type,
        data: action.payload.data,
      });
    },
    removeDialog(state, action: PayloadAction<string>) {
      state.dialogs = state.dialogs.filter((d) => d.id !== action.payload);
    },
    clearAllToasts(state) {
      state.toasts = [];
    },
    clearAllDialogs(state) {
      state.dialogs = [];
    },
  },
});

export const { addToast, removeToast, addDialog, removeDialog, clearAllToasts, clearAllDialogs } =
  uiSlice.actions;
export default uiSlice.reducer;
