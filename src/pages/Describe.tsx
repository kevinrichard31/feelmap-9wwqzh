import { 
  IonContent, 
  IonPage, 
  IonButton 
} from '@ionic/react';
import { useHistory } from 'react-router-dom'; 
import './Describe.css';
import { useEmotion } from '../contexts/EmotionContext';
import { useEffect, useRef, useState } from 'react';
import { createUser, saveEmotion } from '../utils/api';

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude } = useEmotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const ionContentElement = document.querySelector('ion-content');

    if (ionContentElement && background) {
      ionContentElement.style.setProperty('--ion-background-color', background);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      if (ionContentElement) {
        ionContentElement.style.removeProperty('--ion-background-color');
      }
    };
  }, [background]);

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

    const emotionDetails = {
      latitude: latitude ?? 0, // Garantir que latitude est un nombre
      longitude: longitude ?? 0, // Garantir que longitude est un nombre
      emotionName: emotion || '', // Chaîne vide si null/undefined
      description: inputRef.current?.value || '', // Chaîne vide si non défini
    };

    const result = await saveEmotion(
      userId || '', // Forcer une chaîne vide si null
      userPassword || '', // Forcer une chaîne vide si null
      emotionDetails
    );

    if (result) {
      console.log('Emotion saved successfully:', result);
      const emotionDate = new Date().toISOString().split('T')[0];
      history.push(`/emotiondetail/?date=${encodeURIComponent(emotionDate)}`);
    } else {
      setError('Failed to save emotion');
    }

    setIsSaving(false);
  };

  return (
    <IonPage className="describe">
      <IonContent>
        <img src={image} className="emoji-size" alt="Emotion" />
        <div className="container-input">
          <div className="describe-title">Décris ce qui se passe :</div>
          <textarea 
            ref={inputRef} 
            className="inputTextDescribe" 
            placeholder="Décris ton émotion" 
          />
          <IonButton 
            className="button-next" 
            onClick={handleSave} 
            disabled={isSaving}
            expand="full"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </IonButton>
          {error && <div className="error-message">{error}</div>}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Describe;
