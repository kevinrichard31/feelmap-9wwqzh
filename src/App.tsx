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
  IonFabButton,
  useIonRouter
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, location, calendarNumber, settingsOutline, settings, people, personAdd, person, barChart, pieChart, analytics } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import './theme/variables.css';
import './theme/global.css';
import { EmotionProvider } from './contexts/EmotionContext';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import Select from './pages/Select';
import Describe from './pages/Describe';
import { checkUserExists, createUser } from './utils/api';
import EmotionDetail from './pages/EmotionDetail';
import { Device } from '@capacitor/device';
import { Keyboard } from '@capacitor/keyboard';
import SelectPlace from './pages/SelectPlace';

setupIonicReact();

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const router = useIonRouter();

  useEffect(() => {
    const showKeyboardHandler = () => {
      setIsKeyboardVisible(true);
      document.body.classList.add('keyboard-visible');
    };

    const hideKeyboardHandler = () => {
      setIsKeyboardVisible(false);
      document.body.classList.remove('keyboard-visible');
    };

    Keyboard.addListener('keyboardWillShow', showKeyboardHandler);
    Keyboard.addListener('keyboardWillHide', hideKeyboardHandler);

    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);



  useEffect(() => {
    const initialize = async () => {
      try {
        const { value: userLocale } = await Device.getLanguageCode();
        console.log("🌱 - Device.getLanguageCode - locale:", userLocale);

        const storedUserId = localStorage.getItem('userId');
        const storedPassword = localStorage.getItem('password');

        if (!storedUserId) {
          const { id, password } = await createUser(userLocale);
          if (id) {
            localStorage.setItem('userId', id);
            localStorage.setItem('password', password);
            console.log('User ID stored:', id);
          }
        } else {
          const exists = await checkUserExists(storedUserId);
          if (!exists) {
            localStorage.removeItem('userId');
            localStorage.removeItem('password');
            console.log('User ID and password removed from localStorage');
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


  return (
    <EmotionProvider>
      <IonApp>
        <IonReactRouter>
          <div className='container-relative'>
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
                <Route path="/selectplace">
                  <SelectPlace />
                </Route>
                <Route exact path="/">
                  <Redirect to="/select" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom" className={isKeyboardVisible ? 'hidden' : ''}>
                <IonTabButton tab="tab1" href="/tab1">
                  <IonIcon aria-hidden="true" icon={location} />
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon aria-hidden="true" icon={calendarNumber} />
                </IonTabButton>
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
            </IonTabs>
          </div>
          <IonRouterLink routerLink="/select" className={`tab3-button ${isKeyboardVisible ? 'hidden' : ''}`}>
          <IonFabButton
          className={`tab3-button ${isKeyboardVisible ? 'hidden' : ''}`}

          style={{ textDecoration: 'none' }}
        >
          <img src="/feellogo.svg" className="logo-button" alt="Logo" />
        </IonFabButton>
          </IonRouterLink>

        </IonReactRouter>

      </IonApp>
    </EmotionProvider>
  );
};

export default App;