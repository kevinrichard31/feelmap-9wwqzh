import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';
import L from 'leaflet';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const position: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        });
        setCoordinates(position);
      } catch (err) {
        console.error('Error getting location:', err);
        setError('Unable to retrieve your location');
      }
    };
  
    fetchCoordinates();
  }, []);  

  useEffect(() => {
    if (coordinates && !map) {
      // Initialize the map once we have the coordinates
      const mapInstance = L.map('map').setView([coordinates.coords.latitude, coordinates.coords.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Add a square (rectangle) to indicate the current position
      const bounds = L.latLngBounds(
        [coordinates.coords.latitude - 0.001, coordinates.coords.longitude - 0.001],
        [coordinates.coords.latitude + 0.001, coordinates.coords.longitude + 0.001]
      );
      L.rectangle(bounds, { color: 'blue', weight: 1 }).addTo(mapInstance);

      // Add a marker at the user's location
      L.marker([coordinates.coords.latitude, coordinates.coords.longitude]).addTo(mapInstance)
        .bindPopup('You are here')
        .openPopup();

      setMap(mapInstance);
    }
  }, [coordinates, map]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1dfg</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {error && <div className="error-message">{error}</div>}
        <div id="map" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
