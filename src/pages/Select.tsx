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
            Comment te sens-tu <br /> <span className='bold'>maintenant ? 🦦</span>
          </div>

          <div className="choose-emotion">
            Choose your mood <img src="images/arrow-down.svg" alt="" />
          </div>
          <div className="wrap-emoji">



            {emotions.map(({ name, image, imageStatic, background }) => (

              <div key={name} className='container-emoji-single' onClick={() => handleClick(name, imageStatic, background)}>
                <svg className='box' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="auto" style={{ filter: 'drop-shadow(0 1px 1px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 2px 2px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 4px 4px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 8px 8px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 16px 16px hsl(0deg 0% 0% / 0.075))' }}>
                  <path d="M 0, 100 C 0, 12 12, 0 100, 0 S 200, 12 200, 100 188, 200 100, 200 0, 188 0, 100" fill="#EBF1DB"></path>
                </svg>
                <div className='container-content'>

                  <img src={image} alt={name} className="emoji-size" data-emotion={name} />

                  <div style={{ marginTop: '3px' }} className='emotion-name'>{name}</div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Select;
