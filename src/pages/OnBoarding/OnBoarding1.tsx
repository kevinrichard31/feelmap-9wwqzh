import { IonContent, IonPage, IonButton, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import styles from './OnBoarding1.module.css'

import './style.css'

const OnBoarding: React.FC = () => {
  const router = useIonRouter();

  useIonViewWillEnter(() => {
    const tabBar = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const tabButton = document.querySelector('.tab3-button') as HTMLElement | null;

    if (tabBar) tabBar.style.display = 'none';
    if (tabButton) tabButton.style.display = 'none';
  });

  useIonViewWillLeave(() => {
    const tabBar = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const tabButton = document.querySelector('.tab3-button') as HTMLElement | null;

    if (tabBar) tabBar.style.display = 'flex'; // Réafficher la barre de navigation
    if (tabButton) tabButton.style.display = 'flex'; // Réafficher le bouton tab3
  });

  return (
    <IonPage>
      <IonContent fullscreen >
        <div className={styles['background-content']}>

          <img src="./images/onboarding/iconright.svg" alt="" className={styles['iconright']} />
          <div className={styles['title']}>Bienvenue dans<br></br>
            <span className={styles['title-bold']}>Feelmap</span></div>
          <p className={styles['subtitle']}>Ici, tu peux exprimer et comprendre tes émotions.</p>
          <p>Tu ressens plein d’émotions chaque jour. Ici, tu peux les noter, les comprendre et voir comment elles évoluent avec le temps.</p>
          <div onClick={() => router.push('/select', 'forward', 'push')} className={styles['next']}>
            Suivant
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnBoarding;
