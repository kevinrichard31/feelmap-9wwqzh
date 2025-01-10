import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRouterLink, useIonRouter } from '@ionic/react';
import { useEffect } from 'react';  // Importation de useEffect
import { emotions } from '../data/emotions';
import { useEmotion } from '../contexts/EmotionContext';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import './Select.css';

const Select: React.FC = () => {
  const { setEmotion } = useEmotion();
  const routerLink = useIonRouter(); // Utilisation de useIonRouter pour la navigation

  useEffect(() => {
    FirebaseAnalytics.setScreenName({
      screenName: 'select',  // Nom de l'écran
      nameOverride: 'SelectEmotion',  // Facultatif : remplace le nom de la classe de l'écran
    });
  }, []);

  const handleClick = (emotion: string, image: string, background: string) => {
    console.log('coucou');
    // On envoie uniquement l'émotion, l'image et le background
    setEmotion(emotion, image, background, 0, 0);  // Latitude et longitude par défaut à 0
    routerLink.push('/describe');  // Navigation vers la page Describe
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="emotion-selector">
          <div className="title">
            Comment te sens-tu ?
          </div>
          <div className="wrap-emoji">
            {emotions.map(({ name, image, imageStatic, background }) => (
              <div key={name} className='container-emoji-single' onClick={() => handleClick(name, imageStatic, background)}>
                <div className='background-emoji'>
                  <img src={image} alt={name} className="emoji-size" data-emotion={name} />
                </div>
                <div style={{ marginTop: '3px' }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Select;
