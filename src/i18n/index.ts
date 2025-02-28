
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en-US.json';
import translationPT from './locales/pt-BR.json';

// Recursos de tradução
const resources = {
  'en-US': {
    translation: translationEN
  },
  'pt-BR': {
    translation: translationPT
  }
};

i18n
  // Detecta o idioma do usuário
  .use(LanguageDetector)
  // Inicializa o react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // não é necessário para React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
