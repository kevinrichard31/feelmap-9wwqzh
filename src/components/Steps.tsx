import { motion } from 'framer-motion';
import styles from './Steps.module.css';

interface Props {
  currentStep: number;
  maxStep: number;
}

const Steps: React.FC<Props> = ({ currentStep, maxStep }) => {
  // Create an array to render steps
  const steps = [];

  for (let index = 1; index <= maxStep; index++) {
    steps.push(
      <div
        key={index}
        className={index <= currentStep ? styles['stepPlain'] : styles['stepNotPlain']}
      >
      </div>
    );
  }

  return (
    <>
      <div className={styles['steps-container']}>
        {steps}
      </div>
    </>
  );
};

export default Steps;