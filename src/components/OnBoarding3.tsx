import { motion } from 'framer-motion';
import styles from './OnBoarding1.module.css';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const OnBoarding3: React.FC<Props> = ({ onNext, onBack }) => {
  return (
    <motion.div
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 0 }}
    transition={{ duration: 0.5 }}
    className={styles['background-content']}
    >
      <h2>Écran 3 - Comprendre ses émotions</h2>
      <p>Un texte explicatif...</p>

      <div className={styles['buttons']}>
        <button onClick={onBack} className={styles['prev']}>Retour</button>
        <button onClick={onNext} className={styles['next']}>Suivant</button>
      </div>
    </motion.div>
  );
};

export default OnBoarding3;
