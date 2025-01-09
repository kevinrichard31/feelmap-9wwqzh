import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { useIonViewWillEnter } from '@ionic/react';
import L from 'leaflet';
import './Tab1.css';
import 'leaflet/dist/leaflet.css';
import markerIcon from '../icons/current.svg';
import { getAllEmotionsWithAuth } from '../utils/api';
import { emotions as emotionData } from '../data/emotions';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

const Tab1: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emotions, setEmotions] = useState<any[]>([]);
  const routerLink = useIonRouter();

  useEffect(() => {
    FirebaseAnalytics.setScreenName({
      screenName: 'map',  // Nom de l'écran
      nameOverride: 'mapView',  // Facultatif : remplace le nom de la classe de l'écran
    });
  }, []);

  // Référence pour la carte Leaflet
  const mapRef = React.useRef<L.Map | null>(null);

  const fetchCoordinates = async () => {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });
      setCoordinates(position);
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Unable to retrieve your location');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmotions = async () => {
    const userId = localStorage.getItem('userId');
    const password = localStorage.getItem('password');

    if (userId && password) {
      try {
        const fetchedEmotions = await getAllEmotionsWithAuth(userId, password);
        setEmotions(fetchedEmotions.reverse());
      } catch (err) {
        console.error('Error fetching emotions:', err);
      }
    } else {
      console.error('Identifiants non trouvés dans le localStorage');
    }
  };

  const getIconUrl = (emotionName: string) => {
    const emotion = emotionData.find((e) => e.name === emotionName);
    return emotion ? emotion.imageStatic : '/icons/default.svg';
  };

  const handleMarkerClick = (date: string) => {
    routerLink.push(`/emotiondetail/?date=${encodeURIComponent(date)}`);
  };

  const initializeMap = () => {
    if (mapRef.current) {
      mapRef.current.remove(); // Supprime l'ancienne instance de carte si elle existe
    }

    if (coordinates) {
      const mapInstance = L.map('map').setView(
        [coordinates.coords.latitude, coordinates.coords.longitude],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [16, 16],
        iconAnchor: [8, 16],
        popupAnchor: [0, -16],
      });

      L.marker([coordinates.coords.latitude, coordinates.coords.longitude], {
        icon: customIcon,
      })
        .addTo(mapInstance)
        .bindPopup('You are here')
        .openPopup();

      // Sauvegarde la référence de la carte
      mapRef.current = mapInstance;
    }
  };

  const addMarkersToMap = () => {
    if (mapRef.current && emotions.length > 0) {
      emotions.forEach((emotion) => {
        const emotionIcon = L.icon({
          iconUrl: getIconUrl(emotion.emotionName),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const emotionMarker = L.marker([emotion.latitude, emotion.longitude], {
          icon: emotionIcon,
        });

        emotionMarker.on('click', () => handleMarkerClick(emotion.emotionDate));
        emotionMarker.addTo(mapRef.current!);
      });
    }
  };

  useIonViewWillEnter(() => {
    fetchCoordinates();
    fetchEmotions();
  });

  useEffect(() => {
    if (coordinates) {
      initializeMap();
    }
  }, [coordinates]);

  useEffect(() => {
    addMarkersToMap();
  }, [emotions]);

  return (
    <IonPage>
      <IonContent fullscreen>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading map, please wait...</div>}
        <div id="map" style={{ height: '100%' }} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
