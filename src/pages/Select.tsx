import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { emotions } from '../data/emotions';
import { useEmotion } from '../contexts/EmotionContext';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Select.css';
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

const Select: React.FC = () => {
  const { setEmotion } = useEmotion();
  const routerLink = useIonRouter(); // Utilisation de useIonRouter pour la navigation
  const [isPointerDown, setIsPointerDown] = useState(false);  // Pour savoir si l'appui est maintenu
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);  // Nouveau state pour l'élément sélectionné
  const audio = new Audio('/pop.mp3');

  useEffect(() => {
    FirebaseAnalytics.setScreenName({
      screenName: 'select',  // Nom de l'écran
      nameOverride: 'SelectEmotion',  // Facultatif : remplace le nom de la classe de l'écran
    });
  }, []);

  const handleClick = (emotion: string, image: string, background: string) => {
    console.log('coucou');
    // On envoie uniquement l'émotion, l'image et le background
    setEmotion(emotion, image, background, 0, 0);  // Latitude et longitude par défaut à 0
    routerLink.push('/describe', 'forward');  // Navigation vers la page Describe
  };

  const handlePointerStart = (event: React.TouchEvent) => {
    setIsPointerDown(true); // L'appui est maintenu
    // Récupérer directement l'élément cible du touché
    const targetElement = event.target as HTMLElement; // Assurez-vous que l'élément est un HTMLElement
  
    // Vérifier si l'élément ou un de ses parents possède la classe 'container-emoji-single'
    const emojiElement = targetElement.classList.contains('container-emoji-single')
      ? targetElement
      : targetElement.closest('.container-emoji-single') as HTMLElement;
  
    // Si un élément avec la classe 'container-emoji-single' a été trouvé
    if (emojiElement) {
      // Si l'élément sélectionné est différent de celui actuel, on joue le son et met à jour l'état
      const emotionName = emojiElement.querySelector('.emotion-name')?.textContent || '';
      audio.play();
      if (emotionName !== selectedEmotion) {
        setSelectedEmotion(emotionName);  // Met à jour l'émotion sélectionnée
      }

      // Enlever la classe 'active' de tous les éléments
      const allElements = document.querySelectorAll('.container-emoji-single');
      allElements.forEach((el) => {
        el.classList.remove('active2');
      });
  
      // Ajouter la classe 'active' à l'élément sélectionné
      emojiElement.classList.add('active2');
      
      console.log('Element trouvé:', emojiElement);
    }
  };
  

  const handlePointerEnd = () => {
    setIsPointerDown(false); // L'appui a été relâché
    const allElements = document.querySelectorAll('.container-emoji-single');
    allElements.forEach((el) => {
      el.classList.remove('active');
      el.classList.remove('active2');
    });
  };

  const handlePointerMove = (event: React.TouchEvent) => {
    // Détecte le mouvement du doigt
    if (isPointerDown) {
      // Si l'appui est maintenu, on récupère les coordonnées du doigt
      const { clientX, clientY } = event.touches[0];
  
      // On récupère l'élément sous la position clientX, clientY
      const elementUnderFinger = document.elementFromPoint(clientX, clientY);
      // On vérifie si l'élément a la classe 'container-emoji-single', sinon on vérifie son parent
      const targetElement = elementUnderFinger?.classList.contains('container-emoji-single')
        ? elementUnderFinger
        : elementUnderFinger?.closest('.container-emoji-single');
  
      // Si un élément avec la classe a été trouvé
      if (targetElement) {
        // Si l'élément sélectionné est différent de celui actuel, on joue le son et met à jour l'état
        const emotionName = targetElement.querySelector('.emotion-name')?.textContent || '';
        if (emotionName !== selectedEmotion) {
          audio.play();
          setSelectedEmotion(emotionName);  // Met à jour l'émotion sélectionnée
        }

        // Enlever la classe 'active' de tous les éléments
        const allElements = document.querySelectorAll('.container-emoji-single');
        allElements.forEach((el) => {
          el.classList.remove('active');
          el.classList.remove('active2');
        });
  
        // Ajouter la classe 'active' à l'élément sélectionné
        targetElement.classList.add('active');
        
        console.log('Element trouvé:', targetElement);
      }
  
      console.log('Position du doigt:', clientX, clientY);
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className='background-content'
      >
        <div className="emotion-selector">
          <div className="title">
            Comment te sens-tu <br /> <span className='bold'>maintenant ? 🦦</span>
          </div>

          <div className="choose-emotion">
            Choisis ton émotion <img src="images/arrow-down.svg" alt="" />
          </div>
          <div className="wrap-emoji"
                onTouchStart={handlePointerStart}  // Détecte le début du toucher
                onTouchEnd={handlePointerEnd}      // Détecte la fin du toucher
                onTouchMove={handlePointerMove}    // Détecte le mouvement du doigt
          >
            {emotions.map(({ name, image, imageStatic, background, color }) => (
              <div
                key={name}
                className='container-emoji-single'
                onClick={() => handleClick(name, imageStatic, background)}
              >
                <svg
                  className='box'
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  width="100%"
                  style={{
                    filter: 'drop-shadow(0 1px 1px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 2px 2px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 4px 4px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 8px 8px hsl(0deg 0% 0% / 0.075)) drop-shadow(0 16px 16px hsl(0deg 0% 0% / 0.075))'
                  }}
                >
                  <path
                    d="M 0, 100 C 0, 12 12, 0 100, 0 S 200, 12 200, 100 188, 200 100, 200 0, 188 0, 100"
                    fill={color}
                  ></path>
                </svg>
                <div className='container-content'>
                  <DotLottieReact src={image} loop autoplay />
                  <div style={{ marginTop: '3px' }} className='emotion-name'>{name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Select;
