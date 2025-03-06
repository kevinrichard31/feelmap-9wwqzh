import React, { useEffect, useState, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import { getMonthlyEmotions } from '../utils/api';
import { emotions as emotionData } from '../data/emotions';
import './Tab2.css';

// Mois en français
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const Tab2: React.FC = () => {
  const router = useIonRouter();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [emotionsByDay, setEmotionsByDay] = useState<{ [key: number]: any[] }>({});
  const [lastEmotion, setLastEmotion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Récupération des émotions mensuelles
  const fetchEmotions = useCallback(async () => {
    setLoading(true);
    setEmotionsByDay({}); // Vider les émotions avant l'appel API
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Utilisateur non identifié');

      const month = calendarDate.getMonth() + 1;
      const year = calendarDate.getFullYear();

      const emotions = await getMonthlyEmotions(userId, month, year);

      // Organisation des émotions par jour
      const groupedEmotions = emotions.reduce((acc: { [key: number]: any[] }, emotion: any) => {
        const day = new Date(emotion.emotionDate).getDate();
        acc[day] = acc[day] || [];
        acc[day].push(emotion);
        return acc;
      }, {});

      setEmotionsByDay(groupedEmotions);

      // Trouver la dernière émotion
      if (emotions.length > 0) {
        const sortedEmotions = [...emotions].sort(
          (a, b) => new Date(b.emotionDate).getTime() - new Date(a.emotionDate).getTime()
        );
        setLastEmotion(sortedEmotions[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des émotions :', error);
    } finally {
      setLoading(false);
    }
  }, [calendarDate]);

  // Appliquer le fond basé sur la dernière émotion
  useEffect(() => {
    if (lastEmotion) {
      const emotion = emotionData.find(e => e.name === lastEmotion.emotionName);
      document.body.style.background = emotion?.background || '';
    }
    return () => {
      document.body.style.background = ''; // Nettoyage
    };
  }, [lastEmotion]);

  // Charger les émotions à chaque changement de mois
  useEffect(() => {
    fetchEmotions();
  }, [fetchEmotions]);


  useIonViewWillEnter(() => {
    fetchEmotions();
  });

  // Générer le calendrier pour le mois courant
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Gestion du changement de mois
  const changeMonth = (direction: 'previous' | 'next') => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

// Gestion des clics sur un jour
// Gestion des clics sur un jour
const handleDayClick = (day: number) => {
  // Créer la date à partir de la date du calendrier
  const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
  console.log("🚀 ~ handleDayClick ~ selectedDate:", selectedDate);

  // Formater la date correctement en utilisant les méthodes locales
  const formattedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
  console.log("🚀 ~ handleDayClick ~ formattedDate:", formattedDate);

  // Rediriger vers la page avec la nouvelle date formatée
  router.push(`/emotiondetail?date=${formattedDate}`);
};


  // Obtenir l'image d'une émotion
  const getEmotionIcon = (emotionName: string) => {
    const emotion = emotionData.find(e => e.name === emotionName);
    return emotion?.imageStatic || '/icons/default.svg';
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="calendar-container">
          {/* Navigation entre les mois */}
          <div className="calendar-navigation">
            <button onClick={() => changeMonth('previous')}>
              <img src="/images/left.svg" alt="" />
            </button>
            <span className="current-month">
              {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </span>
            <button onClick={() => changeMonth('next')}>
            <img src="/images/right.svg" alt="" />
            </button>
          </div>

          {/* Affichage du calendrier */}
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="calendar">
              {days.map((day) => (
                <div
                  key={day}
                  className={`calendar-day ${emotionsByDay[day] ? '' : 'no-emotion'}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">{day}</div>
                  <div className="emotions-list">
                    {emotionsByDay[day]?.map((emotion, index) => (
                      <img
                        key={index}
                        src={getEmotionIcon(emotion.emotionName)}
                        alt={emotion.emotionName}
                        className="emotion-icon"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
