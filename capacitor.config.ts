import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.kelimece',
  appName: 'Kelimece',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Kelimece',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#f9f7f4',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
}

export default config
