import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import './Tab2.css';
import { useEffect, useState } from 'react';
import { getDailyEmotions } from '../utils/api';
import { useEmotion } from '../contexts/EmotionContext';
import { emotions } from '../data/emotions';
import './EmotionDetail.css'
import { useTranslation } from 'react-i18next';

const EmotionDetail: React.FC = () => {
  function Search() {
    const { emotion, image, background, latitude, longitude } = useEmotion();
    const [emotionsList, setEmotionsList] = useState<any[]>([]);
    const [lastEmotion, setLastEmotion] = useState<any>(null);
    const location = useLocation(); // Utilisation de useLocation pour récupérer les params de la requête
    const { t } = useTranslation();
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
    // Fonction pour obtenir le jour de la semaine traduit
    const getTranslatedWeekday = (date: Date, t: any) => {
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const weekday = weekdays[date.getDay()];
      return t(`days.${weekday}`);
    };

    // Fonction pour obtenir le mois traduit
    const getTranslatedMonth = (date: Date, t: any) => {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const month = months[date.getMonth()];
      return t(`months.${month}`);
    };

    // Fonction pour formater la date en utilisant les traductions
    const formatDate = (dateString: string, t: any) => {
      const dateObject = new Date(dateString);
      const day = dateObject.getDate();
      const translatedWeekday = getTranslatedWeekday(dateObject, t);
      const translatedMonth = getTranslatedMonth(dateObject, t);

      return `${translatedWeekday} ${day} ${translatedMonth}`;
    };

    // Fonction pour formater la date avec l'heure
    const formatDateWithTime = (dateString: string) => {
      const dateObject = new Date(dateString);
      const hours = dateObject.getHours().toString().padStart(2, '0');
      const minutes = dateObject.getMinutes().toString().padStart(2, '0');

      return `${hours}h${minutes}`;
    };
    return (
      <div>
        {date && (
          <div className="selected-date">
        <h2>{formatDate(date, t)}</h2>
          </div>
        )}

        <div>
          {emotionsList.map((emotion: any) => (
            <div key={emotion.id} className="emotion-detail-container">
              <div className="content">
                <div className='emoji-date'>
                  <div className='container-content-emotion-title'>
                    <img src={getStaticImage(emotion.emotionName)} alt={emotion.emotionName} className='img-emotion' />

                    <div className='container-place-type'>
                      <img src={`/images/places/${emotion.placeTypeId}.svg`} className='place-type' />
                    </div>

                  </div>
                  <p className="date">
                    {formatDateWithTime(emotion.emotionDate)} {t('à')} {emotion.city || 'Lieu inconnu'}{emotion.amenity ? ', ' + emotion.amenity : ''}
                  </p>
                </div>
                <p className="description">{emotion.description}                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <Search />
      </IonContent>
    </IonPage>
  );
};

export default EmotionDetail;
