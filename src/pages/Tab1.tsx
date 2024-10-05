import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { Geolocation } from '@capacitor/geolocation';

const Tab1: React.FC = () => {
  const [coordinates, setCoordinates] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const position = await Geolocation.getCurrentPosition();
        console.log('Current position:', position);
        setCoordinates(position);
      } catch (err) {
        console.error('Error getting location:', err);
        setError('Unable to retrieve your location');
      }
    };

    fetchCoordinates();
  }, []); // Empty dependency array to run once on mount

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 11</IonTitle>
          </IonToolbar>
        </IonHeader>
        {error && <div className="error-message">{error}</div>}
        {coordinates ? (
          <ExploreContainer name={`Tab 1 page - Location: ${coordinates.coords.latitude}, ${coordinates.coords.longitude}`} />
        ) : (
          <div>Loading location...</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
