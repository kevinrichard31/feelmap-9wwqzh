// backgroundStore.ts
import { create } from 'zustand';

interface BackgroundState {
  backgroundClass: string;
  setBackgroundClass: (className: string) => void;
}

export const useBackgroundStore = create<BackgroundState>((set) => ({
  backgroundClass: 'background1-content', // Valeur initiale
  setBackgroundClass: (className) => set({ backgroundClass: className }),
}));