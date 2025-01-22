import {
  IonContent,
  IonPage,
  IonButton,
  IonRouterLink,
  IonTextarea,
  IonList,
  IonItem,
  IonLabel,
  useIonViewDidEnter
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react'; // Importation de useEffect et useState
import { useIonRouter } from '@ionic/react';  // Importation de useIonRouter pour la navigation
import { useEmotion } from '../contexts/EmotionContext'; // Accès au contexte pour récupérer les émotions
import { createUser, saveEmotion, getCityFromBDC, getAmenityFromNominatim, getPlaceTypes, updatePlaceType, getLastEmotion } from '../utils/api';
import './SelectPlace.css';
import { t } from 'i18next';

const SelectPlace: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeTypes, setPlaceTypes] = useState<Array<{ id: number; name: string }>>([]); // État pour stocker les types de lieux
  const router = useIonRouter();  // Utilisation de useIonRouter pour la navigation

  // Récupérer les types de lieux à l'entrée de la vue
  useIonViewDidEnter(() => {
    const fetchPlaceTypes = async () => {
      try {
        const types = await getPlaceTypes(); // Appel de l'API pour récupérer les types de lieux
        setPlaceTypes(types);
      } catch (error) {
        console.error('Failed to fetch place types:', error);
        setError('Failed to load place types. Please try again.');
      }
    };

    fetchPlaceTypes();
  });


  const handleClick = async (e: React.MouseEvent<HTMLIonLabelElement>, index: number) => {
    console.log("click");

    // Récupérer les données depuis le localStorage
    const userId = localStorage.getItem("userId");
    const password = localStorage.getItem("password");

    if (!userId || !password) {
      console.error('User ID or password is missing.');
      return;
    }

    console.log("User ID:", userId);
    console.log("Password:", password);


    // Récupérer l'ID de l'émotion ou autre paramètre depuis le dataset
    const placeTypeId = index; // Exemple : calculer placeTypeId à partir de l'index


    // Appel de la fonction updatePlaceType
    try {
      const lastEmotion = await getLastEmotion(userId, password);
      console.log("🚀 ~ handleClick ~ lastEmotion:", lastEmotion);
      const response = await updatePlaceType(lastEmotion.id, userId, password, placeTypeId);
      if (response) {
        console.log("Place type updated successfully:", response);
        const emotionDate = new Date().toISOString().split('T')[0];
        router.push(`/emotiondetail/?date=${encodeURIComponent(emotionDate)}`);

      } else {
        console.error("Failed to update place type");
      }
    } catch (error) {
      console.error("Error during place type update:", error);
    }
  };



  return (
    <IonPage className="describe">
      <IonContent>
        <h1 className=''>{t('setyourlocation')}</h1>
        {error && <p className="error">{error}</p>}
        <IonList className='ionlist-select'>
          {placeTypes.map((place, index) => (
            <div key={place.id} className='item-place'
            data-index={index}
            onClick={(e) => handleClick(e, index + 1)}
            >
              <div className='icons-left'>
                  <img className='img-select-place' src={`images/places/${index + 1}.svg`} alt={`Place ${index + 1}`} />
                <div

                >
                  {t(place.name)}
                </div>
              </div>
              <img src="/images/chevron-right.svg" alt="" />
            </div>
          ))}

        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SelectPlace;
