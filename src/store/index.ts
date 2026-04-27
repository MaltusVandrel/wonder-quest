import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import worldReducer from './slices/worldSlice';
import playerReducer from './slices/playerSlice';
import editorReducer from './slices/editorSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    world: worldReducer,
    player: playerReducer,
    editor: editorReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
