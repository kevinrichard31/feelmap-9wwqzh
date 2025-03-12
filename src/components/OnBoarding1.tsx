import { motion } from 'framer-motion';
import styles from './OnBoarding1.module.css';

interface Props {
  onNext: () => void;
}

const OnBoarding1: React.FC<Props> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles['background-content']}
    >
      <img src="./images/onboarding/iconright.svg" alt="" className={styles['iconright']} />
      <div className={styles['title']}>Bienvenue dans<br></br>
        <span className={styles['title-bold']}>Feelmap</span>
      </div>
      <p className={styles['subtitle']}>Ici, tu peux exprimer et comprendre tes émotions.</p>
      <p>Tu ressens plein d’émotions chaque jour. Ici, tu peux les noter, les comprendre et voir comment elles évoluent avec le temps.</p>

      {/* Bouton "Suivant" */}
      <div className={styles['next-container']}>
        <button onClick={onNext} className={styles['next']}>Suivant</button>
      </div>
    </motion.div>
  );
};

export default OnBoarding1;
