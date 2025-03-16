import { motion } from 'framer-motion';
import styles from './OnBoarding1.module.css';
import Steps from './Steps';
import { useBackgroundStore } from '../store/backgroundOnboarding';
import { useEffect } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  currentStep: [number, number];
}

const OnBoarding2: React.FC<Props> = ({ onNext, onBack, currentStep }) => {
  const setBackgroundClass = useBackgroundStore((state) => state.setBackgroundClass);

  useEffect(() => {
    setBackgroundClass('background2-content');
    console.log('hello');
  }, [setBackgroundClass]); // Ajoute setBackgroundClass comme dépendance pour éviter des problèmes de closure.

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="./images/onboarding/iconright.svg" alt="" className={styles['iconright']} />
        <div className={styles['title']} style={{ paddingTop: '45px', marginBottom: '15px' }}>Note tes émotions <br></br>
          <span className={styles['title-bold']}>au quotidien ✍️</span>
        </div>
        <p className={styles['onboarding-p']}>Prends quelques secondes chaque jour pour noter comment tu te sens. Cela t’aidera à mieux comprendre ton état d’esprit.</p>
        <div className={styles['square-container']}>
          <div className={styles['square']}>
          </div>
          <div className={styles['square-background']}>
          </div>
        </div>
        {/* Bouton "Suivant" */}
        <div className={styles['next-container']}>
          {/* <button onClick={onBack} className={styles['prev']}>Retour</button> */}
          <button onClick={onNext} className={styles['next-second-color']}>Suivant</button>
        </div>

      </motion.div>

      <div className={styles['step-container']}>
        <Steps currentStep={currentStep[0]} maxStep={currentStep[1]} />
      </div>
    </>
  );
};

export default OnBoarding2;