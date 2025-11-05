import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { initializeStorage } from '@utils/storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splashscreen failed to prevent hiding
});

export default function RootLayout() {
  useEffect(() => {
    // Initialize storage (with corruption recovery) and hide splash
    initializeStorage()
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
  }, []);

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
