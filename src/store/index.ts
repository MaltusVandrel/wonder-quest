import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import worldReducer from './slices/worldSlice';
import playerReducer from './slices/playerSlice';
import editorReducer from './slices/editorSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    world: worldReducer,
    player: playerReducer,
    editor: editorReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/addDialog', 'ui/addToast'],
        ignoredPaths: ['ui.dialogs', 'ui.toasts'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
