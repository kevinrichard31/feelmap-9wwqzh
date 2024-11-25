import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRouterLink, useIonRouter } from '@ionic/react';
import { useHistory } from 'react-router-dom';  // Importation de useHistory pour la navigation
import './Select.css';
import { emotions } from '../data/emotions';
import { useEmotion } from '../contexts/EmotionContext';

const Select: React.FC = () => {
  const { setEmotion } = useEmotion();
  const routerLink = useIonRouter(); // Utilisation de useIonRouter pour la navigation

  const handleClick = (emotion: string, image: string, background: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(position.coords);
          setEmotion(emotion, image, background, latitude, longitude);
          routerLink.push('/describe');  // Utilisation de routerLink.push pour la navigation
        },
        (error) => {
          console.error('Error fetching location', error);
          // Si la géolocalisation échoue, continuer sans les coordonnées
          setEmotion(emotion, image, background, 0, 0);
          routerLink.push('/describe');  // Utilisation de routerLink.push pour la navigation
        }
      );
    } else {
      // Si le navigateur ne supporte pas la géolocalisation, continuer sans
      setEmotion(emotion, image, background, 0, 0);
      routerLink.push('/describe');  // Utilisation de routerLink.push pour la navigation
    }
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
              <div style={{marginTop: '3px'}}>{name}</div>
            </div>
          ))}
        </div>
      </div>

        {/* <div className='button-next' onClick={() => history.push('/tab1')} style={{marginTop: '30px'}}>Passer</div> */}

      </IonContent>
    </IonPage>
  );
};

export default Select;