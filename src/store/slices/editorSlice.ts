import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
  isActive: boolean;
  activeTool: string;
  activeLayer: number;
  history: unknown[];
  future: unknown[];
}

const initialState: EditorState = {
  isActive: false,
  activeTool: 'select',
  activeLayer: 1,
  history: [],
  future: [],
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    toggleEditor(state) {
      state.isActive = !state.isActive;
    },
    setActiveTool(state, action: PayloadAction<string>) {
      state.activeTool = action.payload;
    },
    setActiveLayer(state, action: PayloadAction<number>) {
      state.activeLayer = action.payload;
    },
    pushHistory(state, action: PayloadAction<unknown>) {
      state.history.push(action.payload);
      state.future = [];
    },
    undo(state) {
      const last = state.history.pop();
      if (last !== undefined) {
        state.future.push(last);
      }
    },
    redo(state) {
      const next = state.future.pop();
      if (next !== undefined) {
        state.history.push(next);
      }
    },
  },
});

export const { toggleEditor, setActiveTool, setActiveLayer, pushHistory, undo, redo } = editorSlice.actions;
export default editorSlice.reducer;
