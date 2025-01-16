import { IonContent, IonPage, IonButton, IonRouterLink, IonTextarea, useIonViewDidEnter } from '@ionic/react';
import { useEffect, useState, useRef } from 'react'; // Importation de useEffect et useState
import { useIonRouter } from '@ionic/react';  // Importation de useIonRouter pour la navigation
import { useEmotion } from '../contexts/EmotionContext'; // Accès au contexte pour récupérer les émotions
import { createUser, saveEmotion, getCityFromBDC, getAmenityFromNominatim } from '../utils/api';
import './Describe.css';

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useIonRouter();  // Utilisation de useIonRouter pour la navigation

  useIonViewDidEnter(() => {
    if (inputRef.current) {
      inputRef.current.setFocus();
    }
  });

  useEffect(() => {
    const ionContentElement = document.querySelector('ion-content');

    if (ionContentElement && background) {
      // ionContentElement.style.setProperty('--ion-background-color', background);
    }

    if (inputRef.current) {
      inputRef.current?.setFocus();
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
        // router.push(`/emotiondetail/?date=${encodeURIComponent(emotionDate)}`);  
        router.push('/selectplace')
        // Utilisation de router.push pour naviguer
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

  const goToSelect = () =>{
    router.push('/select', 'back')
  }

  return (
    <IonPage className="describe">
      <IonContent>
        <div className='content-container'>


          <div className="container-input">


              <img src="/images/back.svg" alt="Retour" className="back-img" onClick={goToSelect}/>


            <div className='container-title'>
              <img src={image} className="emoji-size" alt="Emotion" />
              <div className="describe-title">Vous avez choisi la joie, <br /><span className='describe-title-bold'>décrivez ce qui se passe :</span></div>
            </div>
            {/* <textarea ref={inputRef} className="inputTextDescribe" placeholder="Décris ton émotion" /> */}
            <IonTextarea ref={inputRef} readonly={false} placeholder="Décris ton émotion" className='textarea'></IonTextarea>
            <IonButton className="button-next" onClick={handleSave} disabled={isSaving} expand="full">
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </IonButton>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Describe;
