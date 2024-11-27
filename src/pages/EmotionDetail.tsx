import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';

const EmotionDetail: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Emotion Detail</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Emotion Detail</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="BIENVENUE DANS LE DETAIL DES EMOTIONS" />
      </IonContent>
    </IonPage>
  );
};

export default EmotionDetail;
