import { IonContent, IonPage, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import styles from './OnBoarding1.module.css';
import OnBoarding1 from '../../components/OnBoarding1';
import OnBoarding2 from '../../components/OnBoarding2';
import OnBoarding3 from '../../components/OnBoarding3';

const OnBoarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = avancer, -1 = reculer

  useIonViewWillEnter(() => {
    const tabBar = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const tabButton = document.querySelector('.tab3-button') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'none';
    if (tabButton) tabButton.style.display = 'none';
  });

  useIonViewWillLeave(() => {
    const tabBar = document.querySelector('ion-tab-bar') as HTMLElement | null;
    const tabButton = document.querySelector('.tab3-button') as HTMLElement | null;
    if (tabBar) tabBar.style.display = 'flex';
    if (tabButton) tabButton.style.display = 'flex';
  });

  // Fonction pour avancer
  const handleNext = () => {
    if (step < 3) {
      setDirection(1); // Animation vers l'avant
      setStep(step + 1);
    }
  };

  // Fonction pour revenir en arrière
  const handleBack = () => {
    if (step > 1) {
      setDirection(-1); // Animation vers l'arrière
      setStep(step - 1);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className={styles['background-content']}>
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && <OnBoarding1 key="step1" onNext={handleNext} />}
            {step === 2 && <OnBoarding2 key="step2" onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <OnBoarding3 key="step3" onNext={handleNext} onBack={handleBack} />}
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnBoarding;
