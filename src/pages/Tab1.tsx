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

const Tab1: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emotions, setEmotions] = useState<any[]>([]);
  const routerLink = useIonRouter();

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
        .openPopup();

      // Sauvegarde la référence de la carte
      mapRef.current = mapInstance;
    }
  };

  const addMarkersToMap = () => {
    if (mapRef.current && emotions.length > 0) {
      emotions.forEach((emotion) => {
        // Définir l'icône principale du marker
        const emotionIcon = L.icon({
          iconUrl: getIconUrl(emotion.emotionName), // URL de l'icône principale
          iconSize: [40, 40],
          iconAnchor: [16, 32], // Point d'ancrage (base de l'icône)
          popupAnchor: [0, -32], // Optionnel, si vous utilisez un popup
        });
  
        // Créer le marker principal
        const emotionMarker = L.marker([emotion.latitude, emotion.longitude], {
          icon: emotionIcon,
        });
  
        // Définir une image supplémentaire pour l'indicateur (type de lieu)
        const additionalIcon = L.divIcon({
          html: `<img src="images/places/1.svg" alt="${emotion.type}" 
                  />`,
          className: 'custom-indicator', // Optionnel pour des styles supplémentaires
        });
  
        // Ajouter un deuxième marker pour afficher l'image à côté/superposée
        const indicatorMarker = L.marker([emotion.latitude, emotion.longitude], {
          icon: additionalIcon,
          interactive: false, // Rendre l'image non-interactive
        });
  
        // Ajouter les deux markers à la carte
        emotionMarker.addTo(mapRef.current!);
        indicatorMarker.addTo(mapRef.current!);
  
        // Gérer les clics uniquement sur le marker principal
        emotionMarker.on('click', () => handleMarkerClick(emotion.emotionDate));
      });
    }
  };
  
  useIonViewWillEnter(() => {
    const initialize = async () => {
      try {
        // Attendre la fin de fetchCoordinates
        await fetchCoordinates();
  
        // Une fois les coordonnées récupérées, fetch les émotions
        await fetchEmotions();
      } catch (error) {
        console.error('Error during initialization:', error);
      }
        console.log("🚀 ~ initialize ~ fetchEmotions:", fetchEmotions)
        console.log("🚀 ~ initialize ~ fetchCoordinates:", fetchCoordinates)
    };
  
    // Appeler la fonction d'initialisation
    initialize();
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
