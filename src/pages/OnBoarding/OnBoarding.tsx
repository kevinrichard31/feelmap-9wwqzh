import { IonContent, IonPage, useIonViewWillEnter, useIonViewWillLeave, useIonRouter } from '@ionic/react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import styles from './OnBoarding1.module.css';
import OnBoarding1 from '../../components/OnBoarding1';
import OnBoarding2 from '../../components/OnBoarding2';
import OnBoarding3 from '../../components/OnBoarding3';
import OnBoarding4 from '../../components/OnBoarding4';
import OnBoarding5 from '../../components/OnBoarding5';
import OnBoarding6 from '../../components/OnBoarding6';
import { useBackgroundStore } from '../../store/backgroundOnboarding';
import './style.css';

// Create a new store for onboarding status
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
}

// Create a persisted store to track onboarding completion
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      setOnboardingCompleted: (completed) => set({ hasCompletedOnboarding: completed }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

interface OnBoardingProps {
  setActiveTab: (tab: string) => void; // Add this prop
}

const OnBoarding: React.FC<OnBoardingProps> = ({ setActiveTab }) => {  // Update the function signature
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = avancer, -1 = reculer
  const maxStep = 6;
  const backgroundClass = useBackgroundStore((state) => state.backgroundClass);
  const router = useIonRouter();
  const { hasCompletedOnboarding, setOnboardingCompleted } = useOnboardingStore();

  useIonViewWillEnter(() => {
    // If onboarding is already completed, redirect to select page
    console.log('hello')
    console.log(hasCompletedOnboarding)
    if (hasCompletedOnboarding) {
      setActiveTab('');  // Clear active tab before navigating
      router.push('/select', 'forward', 'replace');
    }
  }, [hasCompletedOnboarding, router, setActiveTab]);

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
    if (step < maxStep) {
      setDirection(1); // Animation vers l'avant
      setStep(step + 1);
      console.log(step)
    } else if (step === maxStep) {
      // User has completed the onboarding
      setOnboardingCompleted(true);
      setActiveTab(''); // Clear active tab before navigating
      router.push('/select', 'forward', 'replace');
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
        {!hasCompletedOnboarding &&
          <div className={backgroundClass}>
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && <OnBoarding1 key="step1" currentStep={[step, maxStep]} onNext={handleNext} />}
              {step === 2 && <OnBoarding2 key="step2" currentStep={[step, maxStep]} onNext={handleNext} onBack={handleBack} />}
              {step === 3 && <OnBoarding3 key="step3" currentStep={[step, maxStep]} onNext={handleNext} onBack={handleBack} />}
              {step === 4 && <OnBoarding4 key="step4" currentStep={[step, maxStep]} onNext={handleNext} onBack={handleBack} />}
              {step === 5 && <OnBoarding5 key="step5" currentStep={[step, maxStep]} onNext={handleNext} onBack={handleBack} />}
              {step === 6 && <OnBoarding6 key="step6" currentStep={[step, maxStep]} onNext={handleNext} onBack={handleBack} />}
            </AnimatePresence>
          </div>
        }

      </IonContent>
    </IonPage>
  );
};

export default OnBoarding;