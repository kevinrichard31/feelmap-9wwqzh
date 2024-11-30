import {
  IonContent,
  IonPage,
  useIonRouter,
} from '@ionic/react';
import './Select.css';
import { emotions } from '../data/emotions';
import { useEmotion } from '../contexts/EmotionContext';
import { lazy } from 'react';

const DescribeView = lazy(() => import('../pages/Describe'));

const Select: React.FC = () => {
  const { setEmotion } = useEmotion();
  const router = useIonRouter();

  // Gestion de l'émotion et de la géolocalisation
  const handleClick = async (emotion: string, image: string, background: string) => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            setEmotion(emotion, image, background, latitude, longitude);
            router.push('/describe');
          },
          (error) => {
            console.error('Erreur de géolocalisation :', error);
            // Si la géolocalisation échoue, passer des coordonnées par défaut
            setEmotion(emotion, image, background, 0, 0);
            router.push('/describe');
          }
        );
      } else {
        console.warn('La géolocalisation n’est pas supportée par ce navigateur.');
        setEmotion(emotion, image, background, 0, 0);
        router.push('/describe');
      }
    } catch (err) {
      console.error('Une erreur inattendue est survenue :', err);
      setEmotion(emotion, image, background, 0, 0);
      router.push('/describe');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="emotion-selector">
          <div className="title">Comment te sens-tu ?</div>
          <div className="wrap-emoji">
            {emotions.map(({ name, image, imageStatic, background }) => (
              <div
                key={name}
                className="container-emoji-single"
                onClick={() => handleClick(name, imageStatic, background)}
              >
                <div className="background-emoji">
                  <img src={image} alt={name} className="emoji-size" />
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
