import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.feelmap.app',
  appName: 'feelmap',
  webDir: 'dist',
  plugins: {
    Keyboard: {
        resize: 'none', // Empêche le contenu de remonter
    },
}
};

export default config;
