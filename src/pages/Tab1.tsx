import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage } from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { useIonViewWillEnter } from '@ionic/react';
import L from 'leaflet';
import './Tab1.css';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet styles are included
import markerIcon from '../icons/current.svg'; // Import your custom icon

const Tab1: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // New loading state

  const fetchCoordinates = async () => {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      setCoordinates(position);
      setLoading(false); // Set loading to false once coordinates are fetched
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Unable to retrieve your location');
      setLoading(false); // Set loading to false in case of an error
    }
  };

  useEffect(() => {
    if (coordinates && !map) {
      setLoading(true); // Set loading to true while initializing the map
      // Initialize the map once we have the coordinates
      const mapInstance = L.map('map').setView([coordinates.coords.latitude, coordinates.coords.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Define a custom icon for the marker
      const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [16, 16], // Adjust the size as needed
        iconAnchor: [16, 16], // Adjust to position the icon correctly
        popupAnchor: [-8, -16], // Position of the popup relative to the icon
      });

      // Add a marker with the custom icon at the user's location
      L.marker([coordinates.coords.latitude, coordinates.coords.longitude], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup('You are here')
        .openPopup();

      setMap(mapInstance);
      setLoading(false); // Set loading to false once map is initialized
    }
  }, [coordinates, map]);

  // Use `useIonViewWillEnter` to fetch coordinates when the tab is active
  useIonViewWillEnter(() => {
    fetchCoordinates();
    if (map && coordinates) {
      // Update the map's view to the new coordinates
      map.setView([coordinates.coords.latitude, coordinates.coords.longitude], 13);

      // Define the custom icon again for updates
      const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [16, 16],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      // Update the marker position with the custom icon
      L.marker([coordinates.coords.latitude, coordinates.coords.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup('You are here')
        .openPopup();
    }
  });

  return (
    <IonPage>

      <IonContent fullscreen>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading map, please wait...</div>}
        <div id="map" style={{ height: '100%' }} /> {/* Ensure map has a defined height */}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
