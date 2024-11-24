import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom'; 
import './Describe.css';
import { useEmotion } from '../contexts/EmotionContext';
import { useEffect, useRef, useState } from 'react';
import { createUser, saveEmotion } from '../utils/api';
import { arrowBack } from 'ionicons/icons'; // Utilisation de l'icône Ion

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude } = useEmotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    // Sélectionner ion-content
    const ionContentElement = document.querySelector('ion-content');
    
    if (ionContentElement && background) {
      // Utiliser setProperty pour appliquer la couleur d'arrière-plan dynamiquement
      ionContentElement.style.setProperty('--ion-background-color', background);
    }
  
    if (inputRef.current) {
      inputRef.current.focus();
    }
  
    return () => {
      if (ionContentElement) {
        // Réinitialiser la couleur de fond lors du démontage du composant
        ionContentElement.style.removeProperty('--ion-background-color');
      }
    };
  }, [background]);
  
  
  

  const handleSave = async () => {
    let userId = await asyncLocalStorage.getItem('userId');
  
    if (!userId) {
      userId = await createUser();
      if (!userId) {
        setError('Failed to create user');
        return;
      }
      await asyncLocalStorage.setItem('userId', userId.id);
    }
 
  
    setIsSaving(true);
    setError(null);
  
    const emotionDetails = {
      latitude,
      longitude,
      emotionName: emotion,
      description: inputRef.current?.value || '',
    };
  
    const result = await saveEmotion(userId.id, emotionDetails);
  
    if (result) {
      console.log('Emotion saved successfully:', result);
      const emotionDate = new Date().toISOString().split('T')[0];
      history.push(`/emotiondetail/?date=${encodeURIComponent(emotionDate)}`);
    } else {
      setError('Failed to save emotion');
    }
  
    setIsSaving(false);
  };
  

  const asyncLocalStorage = {
    getItem: async (key) => {
      return Promise.resolve(localStorage.getItem(key));
    },
    setItem: async (key, value) => {
      return Promise.resolve(localStorage.setItem(key, value));
    },
  };
  
  return (
    <IonPage className="describe">

      <IonContent>
        <img src={image} className="emoji-size" alt="Emotion" />
        <div className='container-input'>
          <div className='describe-title'>Décris ce qui se passe :</div>
          <textarea 
            ref={inputRef} 
            className='inputTextDescribe' 
            placeholder='Décris ton émotion' 
          />
          <IonButton 
            className='button-next' 
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
