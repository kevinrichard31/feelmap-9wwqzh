import { IonContent, IonPage, IonButton } from '@ionic/react';
import { useEffect, useState, useRef } from 'react'; // Importation de useEffect et useState
import { useIonRouter } from '@ionic/react';  // Importation de useIonRouter pour la navigation
import { useEmotion } from '../contexts/EmotionContext'; // Accès au contexte pour récupérer les émotions
import { createUser, saveEmotion, getCityFromBDC, getAmenityFromNominatim } from '../utils/api';
import './Describe.css';

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useIonRouter();  // Utilisation de useIonRouter pour la navigation

  useEffect(() => {
    const ionContentElement = document.querySelector('ion-content');

    if (ionContentElement && background) {
      ionContentElement.style.setProperty('--ion-background-color', background);
    }

    // Récupérer la géolocalisation à l'arrivée sur la page
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEmotion(emotion, image, background, latitude, longitude); // Mise à jour du contexte avec la latitude et la longitude
        },
        (error) => {
          console.error('Error fetching location', error);
          setError('Failed to get location');
        }
      );
    } else {
      setError('Geolocation not supported');
    }

    return () => {
      if (ionContentElement) {
        ionContentElement.style.removeProperty('--ion-background-color');
      }
    };
  }, [background, emotion, image, setEmotion]);

  const asyncLocalStorage = {
    getItem: async (key: string): Promise<string | null> => {
      return Promise.resolve(localStorage.getItem(key));
    },
    setItem: async (key: string, value: string): Promise<void> => {
      return Promise.resolve(localStorage.setItem(key, value));
    },
  };

  const handleSave = async () => {
    let userId = await asyncLocalStorage.getItem('userId');
    let userPassword = await asyncLocalStorage.getItem('password');
  
    if (!userId) {
      const user = await createUser();
      if (!user || !user.id) {
        setError('Failed to create user');
        return;
      }
      console.log(`${user.id} created`);
      await asyncLocalStorage.setItem('userId', user.id);
      userId = user.id;
    }
  
    setIsSaving(true);
    setError(null);
  
    try {
      // Récupérer la ville et l'amenity
      const [city, { amenity, type }] = await Promise.all([
        getCityFromBDC(latitude ?? 0, longitude ?? 0),  // Ville
        getAmenityFromNominatim(latitude ?? 0, longitude ?? 0),  // Amenity
      ]);
  
      const emotionDetails = {
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        emotionName: emotion || '',
        description: inputRef.current?.value || '',
        city,
        amenity,
        type
      };
  
      // Sauvegarder l'émotion
      const result = await saveEmotion(
        userId || '',
        userPassword || '',
        emotionDetails
      );
  
      if (result) {
        console.log('Emotion saved successfully:', result);
        const emotionDate = new Date().toISOString().split('T')[0];
        router.push(`/emotiondetail/?date=${encodeURIComponent(emotionDate)}`);  // Utilisation de router.push pour naviguer
      } else {
        setError('Failed to save emotion');
      }
    } catch (err) {
      console.error('Error saving emotion:', err);
      setError('An error occurred while saving your emotion');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage className="describe">
      <IonContent>
        <img src={image} className="emoji-size" alt="Emotion" />
        <div className="container-input">
          <div className="describe-title">Décris ce qui se passe :</div>
          <textarea ref={inputRef} className="inputTextDescribe" placeholder="Décris ton émotion" />
          <IonButton className="button-next" onClick={handleSave} disabled={isSaving} expand="full">
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </IonButton>
          {error && <div className="error-message">{error}</div>}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Describe;
