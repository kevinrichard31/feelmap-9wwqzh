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

const OnBoarding3: React.FC<Props> = ({ onNext, onBack, currentStep }) => {
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
        <div className={styles['title']} style={{ paddingTop: '45px', marginBottom: '15px' }}><span className={styles['title-bold']}>Explore</span>
          <br></br>
          qui tu es vraiment
        </div>
        <p className={styles['onboarding-p']}>Visualise tes hauts, tes bas et tout ce qu’il y a entre les deux. Apprends à mieux comprendre tes émotions jour après jour.</p>
        <div className={styles['ob3traits-container']}>
          <img src="./images/onboarding/ob3traits.svg" alt="" className={styles['image']} />
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

export default OnBoarding3;