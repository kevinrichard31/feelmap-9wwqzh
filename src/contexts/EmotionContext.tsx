import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

// Define the type for the context values
interface EmotionContextType {
  emotion: string;
  image: string;
  background: string;
  latitude?: number;
  longitude?: number;
  onboardingpagenumber?: number;
  setEmotion: (emotion: string, image: string, background: string, latitude: number, longitude: number, onboardingpagenumber : number) => void;
}

// Create a context with default values
const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emotion, setEmotionState] = useState<string>('');
  const [image, setImageState] = useState<string>('');
  const [background, setBackgroundState] = useState<string>('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [onboardingpagenumber, setonboardingpagenumber] = useState<number>();

  // Check if running in the browser and access localStorage accordingly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Récupérer les données depuis le localStorage
      const storedEmotion = localStorage.getItem('emotion') || '';
      const storedImage = localStorage.getItem('image') || '';
      const storedBackground = localStorage.getItem('background') || '';
      const storedLatitude = localStorage.getItem('latitude');
      const storedLongitude = localStorage.getItem('longitude');
  
      // Mettre à jour les états avec les données du localStorage
      setEmotionState(storedEmotion);
      setImageState(storedImage);
      setBackgroundState(storedBackground);
  
      // Mettre à jour la latitude et longitude si elles existent
      if (storedLatitude && storedLongitude) {
        setLatitude(parseFloat(storedLatitude));
        setLongitude(parseFloat(storedLongitude));
      }
    }
  }, []);

  // Function to update emotion, image, and background, and store them in localStorage
  const updateEmotion = (emotion: string, image: string, background: string, latitude: number, longitude: number) => {
    setEmotionState(emotion);
    setImageState(image);
    setBackgroundState(background);
    setLatitude(latitude);
    setLongitude(longitude);
    if (typeof window !== 'undefined') {
      localStorage.setItem('emotion', emotion);
      localStorage.setItem('image', image);
      localStorage.setItem('background', background);
      localStorage.setItem('latitude', latitude.toString());
      localStorage.setItem('longitude', longitude.toString());
    }
  };

  return (
    <EmotionContext.Provider value={{ emotion, image, background, setEmotion: updateEmotion, latitude, longitude, onboardingpagenumber }}>
      {children}
    </EmotionContext.Provider>
  );
};

// Custom hook to use the Emotion context
export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};
