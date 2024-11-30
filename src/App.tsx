import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRouterLink,
  setupIonicReact,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, location, calendarNumber, settingsOutline, settings } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import './theme/variables.css'; // Ensure you have your theme variables

import { EmotionProvider } from './contexts/EmotionContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Ionic Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';
import Select from './pages/Select';
import Describe from './pages/Describe';
import { checkUserExists, createUser } from './utils/api';
import EmotionDetail from './pages/EmotionDetail';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const initializeUser = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedPassword = localStorage.getItem('password');

      // Si l'ID n'est pas dans le localStorage, créer un nouvel utilisateur
      if (!storedUserId && !storedPassword) {
        try {
          const { id, password } = await createUser();
          if (id) {
            localStorage.setItem('userId', id); // Stocke l'ID dans localStorage
            localStorage.setItem('password', password);
            console.log('User ID stored:', id);
          }
        } catch (error) {
          console.error('Error creating user:', error);
        }
      } else {
        // Vérifier si l'utilisateur avec cet ID existe
        try {
          const exists = await checkUserExists(storedUserId);
          if (!exists) {
            // Supprimer les informations du localStorage si l'utilisateur n'existe pas
            localStorage.removeItem('userId');
            localStorage.removeItem('password');
            console.log('User ID and password removed from localStorage');
          } else {
            console.log('User ID exists in the database:', storedUserId);
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
        }
      }
    };

    // Appeler la fonction initiale
    initializeUser();
  }, []);
return (<EmotionProvider>
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tab1">
            <Tab1 />
          </Route>
          <Route exact path="/tab2">
            <Tab2 />
          </Route>
          <Route path="/tab3">
            <Tab3 />
          </Route>
          <Route path="/select">
            <Select />
          </Route>
          <Route path="/describe">
            <Describe />
          </Route>
          <Route path="/emotiondetail">
            <EmotionDetail />
          </Route>
          <Route exact path="/">
            <Redirect to="/select" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <IonIcon aria-hidden="true" icon={location} />
            <IonLabel>Carte</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={calendarNumber} />
            <IonLabel>Historique</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={settings} />
            <IonLabel>Paramètre</IonLabel>
          </IonTabButton>
          <IonTabButton disabled>
          </IonTabButton>

        </IonTabBar>

        {/* Use IonRouterLink on a div for navigation to Tab 3 */}

      </IonTabs>
      <IonFabButton
        className="tab3-button"
        routerLink="/select"
        style={{ textDecoration: 'none' }} // Optional: removes underline if you want
      >

        <img src="/feellogo.svg" className="logo-button" />

      </IonFabButton>
    </IonReactRouter>
  </IonApp>
</EmotionProvider>)
  
};

export default App;
