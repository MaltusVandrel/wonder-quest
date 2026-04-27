import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { store } from './store';
import i18n from './i18n';
import App from './App';
import './styles.scss';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    game: any;
  }
}

window.game = window.game || ({} as Record<string, unknown>);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);
