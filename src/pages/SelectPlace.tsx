import { IonContent, IonPage, IonButton, IonRouterLink, IonTextarea, useIonViewDidEnter } from '@ionic/react';
import { useEffect, useState, useRef } from 'react'; // Importation de useEffect et useState
import { useIonRouter } from '@ionic/react';  // Importation de useIonRouter pour la navigation
import { useEmotion } from '../contexts/EmotionContext'; // Accès au contexte pour récupérer les émotions
import { createUser, saveEmotion, getCityFromBDC, getAmenityFromNominatim } from '../utils/api';
import './SelectPlace.css';

const SelectPlace: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useIonRouter();  // Utilisation de useIonRouter pour la navigation


  return (
    <IonPage className="describe">
      <IonContent>
        hello 
      </IonContent>
    </IonPage>
  );
};

export default SelectPlace;
