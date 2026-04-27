import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  language: string;
  volumes: {
    master: number;
    music: number;
    sfx: number;
  };
  fullscreen: boolean;
  showFps: boolean;
}

const initialState: SettingsState = {
  language: 'pt-BR',
  volumes: {
    master: 1,
    music: 1,
    sfx: 1,
  },
  fullscreen: false,
  showFps: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setVolume(
      state,
      action: PayloadAction<{ channel: 'master' | 'music' | 'sfx'; value: number }>
    ) {
      state.volumes[action.payload.channel] = action.payload.value;
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.fullscreen = action.payload;
    },
    setShowFps(state, action: PayloadAction<boolean>) {
      state.showFps = action.payload;
    },
  },
});

export const { setLanguage, setVolume, setFullscreen, setShowFps } = settingsSlice.actions;
export default settingsSlice.reducer;
