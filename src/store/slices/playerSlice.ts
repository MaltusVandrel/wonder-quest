import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  name: string;
  stats: Record<string, number>;
  inventory: unknown[];
  position: { x: number; y: number };
  currentRegion: string;
}

const initialState: PlayerState = {
  name: '',
  stats: {},
  inventory: [],
  position: { x: 0, y: 0 },
  currentRegion: '',
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setStats(state, action: PayloadAction<Record<string, number>>) {
      state.stats = action.payload;
    },
    setInventory(state, action: PayloadAction<unknown[]>) {
      state.inventory = action.payload;
    },
    setPosition(state, action: PayloadAction<{ x: number; y: number }>) {
      state.position = action.payload;
    },
    setCurrentRegion(state, action: PayloadAction<string>) {
      state.currentRegion = action.payload;
    },
  },
});

export const { setPlayerName, setStats, setInventory, setPosition, setCurrentRegion } = playerSlice.actions;
export default playerSlice.reducer;
