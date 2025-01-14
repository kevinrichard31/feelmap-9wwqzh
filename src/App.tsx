import React, { useEffect, useState } from 'react';
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
import { ellipse, square, location, calendarNumber, settingsOutline, settings, people, personAdd, person, barChart, pieChart, analytics } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import './theme/variables.css'; // Ensure you have your theme variables
import './theme/global.css';

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
import { Device } from '@capacitor/device';

setupIonicReact();

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. D'abord, récupérer la langue
        const { value: userLocale } = await Device.getLanguageCode();
        console.log("🌱 - Device.getLanguageCode - locale:", userLocale);

        // 2. Vérifier l'utilisateur existant
        const storedUserId = localStorage.getItem('userId');
        const storedPassword = localStorage.getItem('password');

        if (!storedUserId) {
          // 3. Créer un nouvel utilisateur si nécessaire
          const { id, password } = await createUser(userLocale);
          if (id) {
            localStorage.setItem('userId', id);
            localStorage.setItem('password', password);
            console.log('User ID stored:', id);
          }
        } else {
          // 4. Vérifier si l'utilisateur existe dans la base de données
          const exists = await checkUserExists(storedUserId);
          if (!exists) {
            localStorage.removeItem('userId');
            localStorage.removeItem('password');
            console.log('User ID and password removed from localStorage');
            // Recréer un nouvel utilisateur
            const { id, password } = await createUser(userLocale);
            if (id) {
              localStorage.setItem('userId', id);
              localStorage.setItem('password', password);
              console.log('New user ID stored:', id);
            }
          } else {
            console.log('User ID exists in the database:', storedUserId);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
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
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={calendarNumber} />
          </IonTabButton>
          {/* <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={people} />
          </IonTabButton> */}

          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={analytics} />
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={settings} />
          </IonTabButton>
          <IonTabButton disabled>
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
