import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import './Tab2.css';
import { useEffect, useState } from 'react';
import { getDailyEmotions } from '../utils/api';
import { useEmotion } from '../contexts/EmotionContext';
import { emotions } from '../data/emotions';

const EmotionDetail: React.FC = () => {
  function Search() {
    const { emotion, image, background, latitude, longitude } = useEmotion();
    const [emotionsList, setEmotionsList] = useState<any[]>([]);
    const [lastEmotion, setLastEmotion] = useState<any>(null);
    const location = useLocation(); // Utilisation de useLocation pour récupérer les params de la requête

    // Récupération de la date depuis l'URL
    const date = new URLSearchParams(location.search).get('date'); // extraction du paramètre "date" dans l'URL

    // Utilisation de useEffect pour recharger les données à chaque changement de "date"
    useEffect(() => {
      fetchEmotions();
    }, [location.search]); // L'effet est déclenché à chaque changement d'URL (paramètre "date")

    // Fonction pour récupérer les émotions
    const fetchEmotions = async () => {
      if (date) {
        const userId = localStorage.getItem('userId'); // Récupérer l'ID utilisateur du localStorage

        if (userId) {
          const fetchedEmotions = await getDailyEmotions(userId, date);
          setEmotionsList(fetchedEmotions);

          // Trier les émotions par date et stocker la plus récente
          if (fetchedEmotions.length > 0) {
            const sortedEmotions = [...fetchedEmotions].sort((a, b) => new Date(b.emotionDate).getTime() - new Date(a.emotionDate).getTime());
            setLastEmotion(sortedEmotions[0]);
          }
        }
      }
    };

    // Appliquer le fond sur le body en fonction de la dernière émotion
    useEffect(() => {
      if (lastEmotion) {
        const emotionData = emotions.find(e => e.name === lastEmotion.emotionName);
        if (emotionData) {
          document.body.style.background = emotionData.background; // Applique le fond
        }
      }

      // Nettoyage du background lorsque le composant est démonté
      return () => {
        document.body.style.background = ''; // Réinitialise le background
      };
    }, [lastEmotion]);

    // Trouver l'image statique correspondante à l'émotion
    const getStaticImage = (emotionName: string) => {
      const emotionData = emotions.find((emo) => emo.name === emotionName);
      return emotionData ? emotionData.imageStatic : '';
    };

    // Fonction pour formater la date en "Lundi 1 Août"
    const formatDate = (dateString: string) => {
      const dateObject = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(dateObject);
    };

    // Fonction pour formater la date avec l'heure en "19h35"
    const formatDateWithTime = (dateString: string) => {
      const dateObject = new Date(dateString);
      const formattedTime = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObject);

      return `${formattedTime}`;
    };

    return (
      <div>
        {date && (
          <div className="selected-date">
            <h2>{formatDate(date)}</h2>
          </div>
        )}

        <div>
          {emotionsList.map((emotion: any) => (
            <div key={emotion.id} className="emotion-detail-container">
              <img src={getStaticImage(emotion.emotionName)} alt={emotion.emotionName} />
              <div className="content">
                <p className="date">
                {formatDateWithTime(emotion.emotionDate)} à {emotion.city || 'Lieu inconnu'}{emotion.amenity ? ', ' + emotion.amenity : ''}
                </p>
                <p className="description">{emotion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Détails de l'émotion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Search />
      </IonContent>
    </IonPage>
  );
};

export default EmotionDetail;
