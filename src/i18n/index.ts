import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

export const supportedLanguages = ['pt-BR', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
