import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import './Tab2.css';
import { useEffect, useState } from 'react';
import { getDailyEmotions } from '../utils/api';
import { useEmotion } from '../contexts/EmotionContext';
import { emotions } from '../data/emotions';
import './EmotionDetail.css'
import { useTranslation } from 'react-i18next';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const EmotionDetail: React.FC = () => {
  function Search() {
    const { emotion, image, background, latitude, longitude } = useEmotion();
    const [emotionsList, setEmotionsList] = useState<any[]>([]);
    const [lastEmotion, setLastEmotion] = useState<any>(null);
    const [countdown, setCountdown] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const location = useLocation();
    const { t } = useTranslation();
    const date = new URLSearchParams(location.search).get('date');

    // Fonction pour récupérer les émotions
    const fetchEmotions = async () => {
      if (date) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const fetchedEmotions = await getDailyEmotions(userId, date);
          setEmotionsList(fetchedEmotions);

          if (fetchedEmotions.length > 0) {
            const sortedEmotions = [...fetchedEmotions].sort((a, b) => 
              new Date(b.emotionDate).getTime() - new Date(a.emotionDate).getTime()
            );
            setLastEmotion(sortedEmotions[0]);
          }
        }
      }
    };

    // Effet pour gérer le compteur et le rechargement
    useEffect(() => {
      if (emotionsList.length > 0 && !emotionsList[0].advice) {
        setIsLoading(true);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              fetchEmotions(); // Recharge les données quand le compteur atteint 0
              setCountdown(5); // Réinitialise le compteur
              return 5;
            }
            return prev - 1;
          });
        }, 1000);

        return () => {
          clearInterval(timer);
          setIsLoading(false);
        };
      }
    }, [emotionsList]);

    // Effet initial pour charger les données
    useEffect(() => {
      fetchEmotions();
    }, [location.search]);

    // Effet pour le background
    useEffect(() => {
      if (lastEmotion) {
        const emotionData = emotions.find(e => e.name === lastEmotion.emotionName);
        if (emotionData) {
          document.body.style.background = emotionData.background;
        }
      }
      return () => {
        document.body.style.background = '';
      };
    }, [lastEmotion]);

    // Vos fonctions helpers existantes
    const getStaticImage = (emotionName: string) => {
      const emotionData = emotions.find((emo) => emo.name === emotionName);
      return emotionData ? emotionData.imageStatic : '';
    };

    const getTranslatedWeekday = (date: Date, t: any) => {
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const weekday = weekdays[date.getDay()];
      return t(`days.${weekday}`);
    };

    const getTranslatedMonth = (date: Date, t: any) => {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const month = months[date.getMonth()];
      return t(`months.${month}`);
    };

    const formatDate = (dateString: string, t: any) => {
      const dateObject = new Date(dateString);
      const day = dateObject.getDate();
      const translatedWeekday = getTranslatedWeekday(dateObject, t);
      const translatedMonth = getTranslatedMonth(dateObject, t);
      return `${translatedWeekday} ${day} ${translatedMonth}`;
    };

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
                <p className="description">{emotion.description}</p>
                {emotion.traits && emotion.traits.length > 0 && (
                  <div className="traits-container">
                    <div className="traits-list">
                      {[...emotion.traits].sort((a, b) => b.score - a.score).map((trait: any) => {
                        let displayScore = '';
                        let traitClass = '';

                        if (trait.score === -1) {
                          displayScore = '-1';
                          traitClass = 'trait-negatif';
                        } else if (trait.score === 1) {
                          displayScore = '+1';
                          traitClass = 'trait-positif';
                        }

                        if (displayScore !== '') {
                          return (
                            <div key={trait.id} className={`trait-item ${traitClass}`}>
                              <span className="trait-name">{trait.translated_name}</span>
                              <span className="trait-score">{displayScore}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {emotion.advice && emotion.advice.length > 0 ? (
                  <div className="advice">
                    <img src="/feellogo.svg" alt="Feel Logo" className="advice-logo" />
                    <p className="advice-content">
                      {emotion.advice}
                    </p>
                  </div>
                ) : emotion === emotionsList[0] && ( // Vérifie si c'est la première émotion
                  <div className='animation-container'>
                    <DotLottieReact src='cook.json' loop autoplay className='cook-animation' />
                    <p className='analyse-progr'>
                      Analyse en cours ({countdown}s)
                    </p>
                  </div>
                  
                )}
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