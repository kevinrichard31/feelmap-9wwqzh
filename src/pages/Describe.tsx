import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonContent, IonPage, IonButton, IonTextarea, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { useEmotion } from '../contexts/EmotionContext';
import { saveEmotion, getCityFromBDC, getAmenityFromNominatim } from '../utils/api';
import './Describe.css';
import { useTranslation } from 'react-i18next';
import { Geolocation } from '@capacitor/geolocation';

const MAX_CHARS = 500;

const Describe: React.FC = () => {
  const { emotion, image, background, latitude, longitude, setEmotion } = useEmotion();
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const router = useIonRouter();
  const { t } = useTranslation();

  // --- Set Focus on Textarea After View Enters ---
  useIonViewWillEnter(() => {
    if (inputRef.current) {
      inputRef.current.setFocus();
    }
  }, []);  // Run only once after component mounts

  // --- Get Current Location Using Capacitor Geolocation ---
  const getLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const { latitude, longitude } = position.coords;
      setEmotion(emotion, image, background, latitude, longitude);
      setError(null); // Clear any previous errors
    } catch (error: any) { // Explicitly type 'error' as 'any'
      console.error('Error fetching location', error);
      setError('Failed to get location: ' + error.message); // Include error message
    }
  }, [emotion, image, background, setEmotion]);

  // --- Fetch Location on Component Mount ---
  useEffect(() => {
    getLocation();

    // Cleanup function (not really needed here, but good practice)
    return () => {
      // Any cleanup logic can go here (e.g., cancelling subscriptions)
    };
  }, [getLocation]);

  // --- Handle Textarea Change ---
  const handleTextChange = useCallback((event: CustomEvent) => {
    const text = (event.detail.value || '') as string; // Explicitly cast to string
    let newText = text;

    if (text.length > MAX_CHARS) {
      newText = text.slice(0, MAX_CHARS);
    }
    setCharCount(newText.length);

    if (inputRef.current) {
      inputRef.current.value = newText;
    }
  }, []);

  // --- Save Emotion Data ---
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId') || '';
      const userPassword = localStorage.getItem('password') || '';

      if (!userId || !userPassword) {
        setError('User not logged in.');
        return;
      }

      const [city, placeDetails] = await Promise.all([
        getCityFromBDC(latitude ?? 0, longitude ?? 0),
        getAmenityFromNominatim(latitude ?? 0, longitude ?? 0),
      ]);

      const emotionDetails = {
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        emotionName: emotion || '',
        description: inputRef.current?.value || '',
        city,
        amenity: placeDetails?.amenity || '', // Handle potential undefined values
        type: placeDetails?.type || '',     // Handle potential undefined values
      };

      const result = await saveEmotion(userId, userPassword, emotionDetails);

      if (result) {
        console.log('Emotion saved successfully:', result);
        if (inputRef.current) {
          inputRef.current.value = '';
          setCharCount(0);
        }
        router.push('/selectplace');
      } else {
        setError('Failed to save emotion');
      }
    } catch (error: any) { // Explicitly type 'error' as 'any'
      console.error('Error saving emotion:', error);
      setError(`An error occurred while saving your emotion: ${error.message}`); // Include error message
    } finally {
      setIsSaving(false);
    }
  }, [emotion, latitude, longitude, router, saveEmotion]);

  // --- Go Back to Select Page ---
  const goToSelect = useCallback(() => {
    router.push('/select', 'back');
  }, [router]);

  return (
    <IonPage className="describe">
      <IonContent>
        <div className='content-container'>
          <div className="container-input">
            <img src="/images/back.svg" alt="Retour" className="back-img" onClick={goToSelect} />
            <div className='container-title'>
              <img src={image} className="emoji-size" alt="Emotion" />
              <div className="describe-title">
                {t('youchoosed')} {t(emotion)} <br />
                <span className='describe-title-bold'>{t('describewhathappen')} :</span>
              </div>
            </div>
            <div className="textarea-container">
              <IonTextarea
                ref={inputRef}
                onIonInput={handleTextChange}
                placeholder={t('describeyouremotion')}
                className='textarea'
                maxlength={MAX_CHARS}
              />
              <div className="char-counter">
                {charCount}/{MAX_CHARS}
              </div>
            </div>
            <IonButton
              className="button-next"
              onClick={handleSave}
              disabled={isSaving || charCount === 0}
              expand="full"
            >
              {isSaving ? 'Enregistrement...' : t('register')}
            </IonButton>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Describe;