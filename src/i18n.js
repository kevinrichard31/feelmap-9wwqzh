import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Device } from '@capacitor/device';

// Importation des traductions
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// Fonction pour détecter la langue de l'appareil
const detectDeviceLanguage = async () => {
  const info = await Device.getLanguageCode();
  return info.value || 'en'; // Retourne la langue de l'appareil ou 'en' par défaut
};

// Initialisation d'i18next avec détection de langue et chargement des ressources
const initializeI18n = async () => {
  const deviceLanguage = await detectDeviceLanguage();

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
    },
    lng: deviceLanguage, // Langue détectée sur l'appareil
    fallbackLng: 'en', // Langue par défaut si non détectée
    interpolation: {
      escapeValue: false, // Pas besoin d'échapper les valeurs
    },
  });
};

initializeI18n();

export default i18n;
