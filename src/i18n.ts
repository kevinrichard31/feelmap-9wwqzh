import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importez les traductions à partir de fichiers JSON (modulaire et extensible)
import frTranslation from './locales/fr.json';
import enTranslation from './locales/en.json';
import brTranslation from './locales/br.json';
import jpTranslation from './locales/jp.json';

// Configuration de i18n
i18n
  .use(initReactI18next) // Connecte i18next à React
  .init({
    resources: {
      fr: { translation: frTranslation },
      br: { translation: brTranslation },
      jp: { translation: jpTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: 'en', // Langue par défaut si la langue de l'utilisateur n'existe pas
    debug: true, // Activez pour le débogage en développement
    interpolation: {
      escapeValue: false, // React gère déjà la sécurité contre les XSS
    },
    detection: {
      // Options supplémentaires si vous utilisez un plugin de détection de langue
      order: ['querystring', 'localStorage', 'navigator'], 
      caches: ['localStorage'],
    },
  react: {
    transKeepBasicHtmlNodesFor: ['br', 'span'], // Conserve les balises spécifiées
  }
  });

export default i18n;
