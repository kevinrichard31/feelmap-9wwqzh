import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab3.css';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { useEffect } from 'react';  // Importation de useEffect

const Tab3: React.FC = () => {
    useEffect(() => {
      FirebaseAnalytics.setScreenName({
        screenName: 'params',  // Nom de l'écran
        nameOverride: 'paramsView',  // Facultatif : remplace le nom de la classe de l'écran
      });
    }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 3 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
