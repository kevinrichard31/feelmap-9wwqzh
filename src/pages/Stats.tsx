import {
  IonContent,
  IonItem,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { useState, useCallback, useEffect } from 'react';
import { getAggregatedScores, getUserTraits } from '../utils/api';
import './Stats.css';
import CenteredProgressBar from '../components/CenteredProgressBar';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

type Score = number;

interface Scores {
  [key: string]: Score;
}

const initialScores: Scores = {
  health_score: 0,
  mental_score: 0,
  physical_score: 0,
  nutrition_score: 0,
  couple_love_score: 0,
  best_friends_score: 0,
  family_only_score: 0,
  workmate_score: 0,
  relaxation_score: 0,
};

interface Trait {
  id: number;
  name: string;
  translated_name: string;
  score: number;
  type: string;
}

// Define the desired order of trait types
const traitTypeOrder = [
  'health',
  'social',
  'personality',
  'interests',
  'brands_mentionned',
];

// Define the possible time ranges and their display names
const timeRangeOptions = {
  last_7_days: '7 derniers jours',
  this_month: 'Ce mois-ci',
  last_month: 'Mois dernier',
  last_3_months: '3 derniers mois',
  today: "Aujourd'hui",
  all: 'Tout',
} as const;

// Type for timeRangeOptions keys
type TimeRangeKey = keyof typeof timeRangeOptions;

const Stats: React.FC = () => {
  const [scores, setScores] = useState<Scores>(initialScores);
  const [traits, setTraits] = useState<Trait[] | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('last_7_days');

  const fetchScores = useCallback(
    async (timeRange: TimeRangeKey) => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const data = await getAggregatedScores(userId, timeRange);
        if (data) {
          setScores(data);
        } else {
          setScores(initialScores);
        }
      } else {
        setScores(initialScores);
      }
    },
    [],
  );

  const fetchTraits = useCallback(async (timeRange?: TimeRangeKey) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const data = await getUserTraits(userId, timeRange); // Pass timeRange here

      if (data && data.traits) {
        // Sort the traits array alphabetically by translated_name
        const sortedTraits = [...data.traits].sort((a, b) =>
          a.translated_name.localeCompare(b.translated_name),
        );
        setTraits(sortedTraits);
      } else {
        setTraits(null);
      }
    } else {
      setTraits(null);
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchScores(selectedTimeRange);
    fetchTraits(selectedTimeRange);
  }, [selectedTimeRange, fetchScores, fetchTraits]);

  useEffect(() => {
    fetchScores(selectedTimeRange);
    fetchTraits(selectedTimeRange);
  }, [selectedTimeRange, fetchScores, fetchTraits]);

  useIonViewWillLeave(() => {
    setScores(initialScores);
  });

  const handleTimeRangeChange = (e: any) => {
    const timeRange = e.detail.value as TimeRangeKey;
    setSelectedTimeRange(timeRange);
  };

  // Function to group traits by type
  const groupTraitsByType = (traits: Trait[] | null): { [key: string]: Trait[] } => {
    if (!traits) {
      return {};
    }

    const grouped: { [key: string]: Trait[] } = {};
    traitTypeOrder.forEach((type) => {
      grouped[type] = [];
    });

    traits.forEach((trait) => {
      if (grouped[trait.type]) {
        grouped[trait.type].push(trait);
      } else {
        grouped[trait.type] = [trait]; // If the type wasn't explicitly listed, add it.  This handles cases where your API might return new trait types.
      }
    });

    return grouped;
  };

  const groupedTraits = groupTraitsByType(traits);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="stats-container">
          <div className='title-container-stats'>
          <h1 className="title" style={{ fontWeight: 400, marginBottom: 15 }}>
            Statistiques
          </h1>
          <IonList>
            <IonItem>
              <IonSelect
                aria-label="Time Range"
                interface="popover"
                value={selectedTimeRange}
                onIonChange={handleTimeRangeChange}
              >
                {Object.entries(timeRangeOptions).map(([key, label]) => (
                  <IonSelectOption key={key} value={key}>
                    {label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>
          </div>


          {/* Santé */}
          <div className="card">
            <h1 className="title" style={{ position: 'relative' }}>
              Moi <img className="me-smile-img" src="/images/me-smile.svg" alt="" />
            </h1>
            <p className="tagline">Nourris ton bien-être et révèle ton potentiel ! 🍃✨</p>
            <div className="subcategory-title">Équilibre vital</div>
            <div className="container-stats-key">
              <div className="container-stats-name">Physique</div>
              <CenteredProgressBar value={scores.physical_score} />
            </div>

            <div className="container-stats-key">
              <div className="container-stats-name">Nutritionnelle</div>
              <CenteredProgressBar value={scores.nutrition_score} />
            </div>

            <div className="container-stats-key">
              <div className="container-stats-name">Mentale</div>
              <CenteredProgressBar value={scores.mental_score} />
            </div>

            <hr />
            <hr />
            <div className="subcategory-title">Esprit</div>
            <div className="container-stats-key">
              <div className="container-stats-name">Score de relaxation</div>
              <CenteredProgressBar value={scores.relaxation_score} />
            </div>
          </div>

          {/* Cercle Social */}
          <div className="card">
            <h1 className="title" style={{ position: 'relative' }}>
              Mon entourage <img className="me-smile-img" src="/images/entourage.svg" alt="" />
            </h1>
            <p className="tagline">Cultive tes liens et vois ceux que tu aimes s'épanouir ! 🌱✨</p>
            <div className="container-stats-key">
              <div className="container-stats-name">Famille</div>
              <CenteredProgressBar value={scores.family_only_score} />
            </div>
            <div className="container-stats-key">
              <div className="container-stats-name">Amour</div>
              <CenteredProgressBar value={scores.couple_love_score} />
            </div>
            <div className="container-stats-key">
              <div className="container-stats-name">Amis</div>
              <CenteredProgressBar value={scores.best_friends_score} />
            </div>
            <div className="container-stats-key">
              <div className="container-stats-name">Collègues</div>
              <CenteredProgressBar value={scores.workmate_score} />
            </div>
          </div>

          {/* Traits Section */}
          {/* Traits Section */}

          <div className="card">
            <h1 className="title">Données avancées</h1>
            <p className="tagline">Explore tes données et découvre tous tes progrès !</p>
            {['health', 'personality', 'interests'].map((type) => (
              <div className="--group" key={type}>
                <div className="subcategory-title">
                  {type === 'health'
                    ? 'Santé'
                    : type === 'personality'
                      ? 'Personnalité'
                      : type === 'interests'
                        ? 'Intérêts'
                        : 'Autres'}
                </div>
                {groupedTraits[type] && groupedTraits[type].length > 0 ? (
                  [...groupedTraits[type]] // Create a copy to avoid modifying the original
                    .sort((a, b) => b.score - a.score) // Sort by score descending
                    .filter((trait) => trait.score !== 0)
                    .map((trait) => (
                      <div key={trait.id} className="container-stats-key">
                        <div className="container-stats-name">{trait.translated_name}</div>
                        <CenteredProgressBar value={trait.score} />
                      </div>
                    ))
                ) : (
                  <p>Aucun trait trouvé pour ce type.</p>
                )}
              </div>
            ))}
            <div>
              
            </div>
          </div>

          <div style={{ height: '300px', color: 'grey', fontSize: '12px' }}>
          Les textes, contenus et indicateurs (positifs ou négatifs) affichés dans cette application sont présentés à des fins purement ludiques et de divertissement. Ils ne doivent en aucun cas être interprétés comme des données médicales, scientifiques, psychologiques ou de tout autre domaine professionnel. Ils sont générés par un algorithme à des fins de divertissement et ne reflètent pas une réalité médicale ou un avis professionnel. Pour toute question ou préoccupation liée à votre santé physique ou mentale, ou nécessitant un avis expert, consultez un professionnel qualifié.
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Stats;