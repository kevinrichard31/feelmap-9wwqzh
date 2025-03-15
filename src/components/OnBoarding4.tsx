import { motion } from 'framer-motion';
import styles from './OnBoarding1.module.css';
import Steps from './Steps';
import { useBackgroundStore } from '../store/backgroundOnboarding';
import { useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface Props {
  onNext: () => void;
  onBack: () => void;
  currentStep: [number, number];
}

const OnBoarding4: React.FC<Props> = ({ onNext, onBack, currentStep }) => {
  const setBackgroundClass = useBackgroundStore((state) => state.setBackgroundClass);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [loadingGeolocation, setLoadingGeolocation] = useState(false);

  useEffect(() => {
    setBackgroundClass('background2-content');
  }, [setBackgroundClass]);

  const requestGeolocation = async () => {
    setLoadingGeolocation(true);
    try {
      await Geolocation.getCurrentPosition();
      setGeolocationEnabled(true);
      setLoadingGeolocation(false);
      console.log("Géolocalisation activée avec succès !");
      onNext(); // Passe à l'étape suivante après l'activation réussie
    } catch (error: any) {
      console.error("Erreur lors de l'activation de la géolocalisation :", error);
      if (error.message.includes('denied')) {
        alert("L'accès à la géolocalisation a été refusé. Veuillez l'activer dans les paramètres de votre application.");
      } else if (error.message.includes('unavailable')) {
        alert("La géolocalisation n'est pas disponible sur cet appareil.");
      } else {
        alert("Une erreur s'est produite lors de l'activation de la géolocalisation.");
      }
      setGeolocationEnabled(false);
      setLoadingGeolocation(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="./images/onboarding/iconright.svg" alt="" className={styles['iconright']} />
        <div className={styles['title']} style={{ paddingTop: '45px', marginBottom: '15px' }}>
          Où te sens-tu 
          <br></br>
          <span className={styles['title-bold']}>vraiment bien ?</span>
        </div>
        <p>Identifie les lieux qui boostent ton énergie et ceux qui te pèsent. Apprends à mieux choisir ton environnement.</p>
        <div className={styles['ob3traits-container']}>
          <img src="./images/onboarding/map.png" alt="" className={styles['map-image']} />
        </div>
        {/* Bouton "Suivant" */}
        <div className={styles['next-container']}>
          {/* <button onClick={onBack} className={styles['prev']}>Retour</button> */}
           <button
              onClick={requestGeolocation}
              className={styles['next-second-color']}
              disabled={loadingGeolocation}
              style={{marginTop: '20px'}}
            >
              {loadingGeolocation ? 'Activation...' : 'Activer la géolocalisation'}
            </button>
            <div onClick={onNext} style={{fontSize: 13}}>Passer cette étape</div>
        </div>

      </motion.div>

      <div className={styles['step-container']}>
        <Steps currentStep={currentStep[0]} maxStep={currentStep[1]} />
      </div>
    </>
  );
};

export default OnBoarding4;