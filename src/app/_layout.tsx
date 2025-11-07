import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { initializeStorage } from '@utils/storage';
import { useSettingsStore } from '@state/useSettings';
import { getAudioManager } from '@audio/index';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splashscreen failed to prevent hiding
});

export default function RootLayout() {
  const loadFromStorage = useSettingsStore((state) => state.loadFromStorage);

  useEffect(() => {
    // Initialize storage (with corruption recovery) and load settings
    initializeStorage()
      .then(() => {
        return loadFromStorage();
      })
      .then(() => {
        // Initialize audio manager
        const audioManager = getAudioManager();
        return audioManager.initialize();
      })
      .then(() => {
        return SplashScreen.hideAsync();
      })
      .catch((error) => {
        console.error('Failed to initialize app:', error);
        // Still hide splash screen even on error
        SplashScreen.hideAsync().catch(() => {
          // Splashscreen failed to hide
        });
      });
  }, [loadFromStorage]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0B0C' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
