import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  currentScene: string;
  isPaused: boolean;
  isEditorMode: boolean;
  saveSlot: number | null;
}

const initialState: GameState = {
  currentScene: 'main-menu-scene',
  isPaused: false,
  isEditorMode: false,
  saveSlot: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentScene(state, action: PayloadAction<string>) {
      state.currentScene = action.payload;
    },
    setPaused(state, action: PayloadAction<boolean>) {
      state.isPaused = action.payload;
    },
    setEditorMode(state, action: PayloadAction<boolean>) {
      state.isEditorMode = action.payload;
    },
    setSaveSlot(state, action: PayloadAction<number | null>) {
      state.saveSlot = action.payload;
    },
  },
});

export const { setCurrentScene, setPaused, setEditorMode, setSaveSlot } = gameSlice.actions;
export default gameSlice.reducer;
