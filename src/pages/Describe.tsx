import { IonContent, IonPage, IonButton, IonRouterLink, IonTextarea, useIonViewDidEnter } from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { useIonRouter } from '@ionic/react';
import { useEmotion } from '../contexts/EmotionContext';
import { createUser, saveEmotion, getCityFromBDC, getAmenityFromNominatim } from '../utils/api';
import './Describe.css';

const MAX_CHARS = 500;

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const router = useIonRouter();

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEmotion(emotion, image, background, latitude, longitude);
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

  const handleTextChange = (event: CustomEvent) => {
    const text = event.detail.value || '';
    setCharCount(text.length);
    
    if (text.length > MAX_CHARS) {
      inputRef.current!.value = text.slice(0, MAX_CHARS);
      setCharCount(MAX_CHARS);
    }
  };

  const handleSave = async () => {
    let userId = await asyncLocalStorage.getItem('userId');
    let userPassword = await asyncLocalStorage.getItem('password');

    setIsSaving(true);
    setError(null);

    try {
      const [city, { amenity, type }] = await Promise.all([
        getCityFromBDC(latitude ?? 0, longitude ?? 0),
        getAmenityFromNominatim(latitude ?? 0, longitude ?? 0),
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

      const result = await saveEmotion(
        userId || '',
        userPassword || '',
        emotionDetails
      );

      if (result) {
        console.log('Emotion saved successfully:', result);
        if (inputRef.current) {
          inputRef.current.value = '';
          setCharCount(0);
        }
        router.push('/selectplace');
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

  const goToSelect = () => {
    router.push('/select', 'back');
  };

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
            <div className="textarea-container">
              <IonTextarea 
                ref={inputRef}
                onIonInput={handleTextChange}
                placeholder="Décris ton émotion"
                className='textarea'
                maxlength={MAX_CHARS}
              />
              <div className="char-counter">
                {charCount}/{MAX_CHARS}
              </div>
            </div>
            <IonButton 
              className="button-next" 
              onClick={handleSave} 
              disabled={isSaving || charCount === 0} 
              expand="full"
            >
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