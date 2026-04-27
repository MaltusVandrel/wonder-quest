import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorldState {
  seed: string;
  biome: string;
  timeOfDay: number;
  weather: string;
  discoveredRegions: string[];
}

const initialState: WorldState = {
  seed: '',
  biome: '',
  timeOfDay: 12,
  weather: 'clear',
  discoveredRegions: [],
};

const worldSlice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    setSeed(state, action: PayloadAction<string>) {
      state.seed = action.payload;
    },
    setBiome(state, action: PayloadAction<string>) {
      state.biome = action.payload;
    },
    setTimeOfDay(state, action: PayloadAction<number>) {
      state.timeOfDay = action.payload;
    },
    setWeather(state, action: PayloadAction<string>) {
      state.weather = action.payload;
    },
    discoverRegion(state, action: PayloadAction<string>) {
      if (!state.discoveredRegions.includes(action.payload)) {
        state.discoveredRegions.push(action.payload);
      }
    },
  },
});

export const { setSeed, setBiome, setTimeOfDay, setWeather, discoverRegion } = worldSlice.actions;
export default worldSlice.reducer;
