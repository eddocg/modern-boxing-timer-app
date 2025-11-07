import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

import { ProgressRing } from '@components/ProgressRing';
import { LightBeacon } from '@components/LightBeacon';
import { PrimaryButton } from '@components/PrimaryButton';

import { useTimerStatus, useTimerActions } from '@state/timerMachine';
import { useSettingsStore } from '@state/useSettings';
import { getAudioManager } from '@audio/index';

/**
 * TimerScreen - Main boxing timer interface
 *
 * Features:
 * - Three-light system (green=work, yellow=final seconds, red=rest)
 * - Circular progress ring with MM:SS display
 * - Play/Pause/Resume controls
 * - Settings navigation
 * - Round counter
 */
export default function TimerScreen() {
  const router = useRouter();

  // Timer state and actions
  const timerStatus = useTimerStatus();
  const { start, pause, resume, reset, setConfig, skip, onAudioCueSubscribe } = useTimerActions();

  // Settings
  const rounds = useSettingsStore((state) => state.rounds);
  const workDuration = useSettingsStore((state) => state.workDuration);
  const restDuration = useSettingsStore((state) => state.restDuration);
  const yellowDuration = useSettingsStore((state) => state.yellowDuration);
  const warmup = useSettingsStore((state) => state.warmup);
  const countdownEnabled = useSettingsStore((state) => state.countdownEnabled);
  const volume = useSettingsStore((state) => state.volume);

  // Audio manager reference
  const audioManagerRef = useRef(getAudioManager());

  // Subscribe to audio cues from timer
  useEffect(() => {
    const audioManager = audioManagerRef.current;
    
    // Update volume when settings change
    audioManager.setVolume(volume).catch((error: unknown) => {
      console.error('Failed to set audio volume:', error);
    });

    // Subscribe to timer audio cues
    onAudioCueSubscribe(async (cue) => {
      if (audioManager.isReady()) {
        await audioManager.playCue(cue);
      }
    });
  }, [volume, onAudioCueSubscribe]);

  // Sync settings to timer config whenever settings change
  useEffect(() => {
    setConfig({
      workDuration,
      restDuration,
      yellowDuration,
      warmupDuration: warmup, // Map warmup -> warmupDuration
      totalRounds: rounds,
      countdownEnabled,
    });
  }, [workDuration, restDuration, yellowDuration, warmup, rounds, countdownEnabled, setConfig]);

  // Handle Play/Pause/Resume button
  const handlePlayPause = () => {
    if (timerStatus.state === 'idle' || timerStatus.state === 'complete') {
      start();
    } else if (timerStatus.isRunning) {
      pause();
    } else {
      resume();
    }
  };

  // Keyboard controls (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ': // Space bar
          event.preventDefault();
          handlePlayPause();
          break;
        case 'r':
          event.preventDefault();
          if (timerStatus.state !== 'idle') {
            reset();
          }
          break;
        case 'n':
          event.preventDefault();
          if (timerStatus.state !== 'idle' && timerStatus.state !== 'complete') {
            skip();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [timerStatus.state, handlePlayPause, reset, skip]);

  // Determine button label based on state
  const getButtonLabel = (): string => {
    if (timerStatus.state === 'idle' || timerStatus.state === 'complete') {
      return 'START';
    }
    if (timerStatus.isRunning) {
      return 'PAUSE';
    }
    return 'RESUME';
  };

  // Determine which lights are on
  const getLightStates = () => {
    return {
      green: timerStatus.lightColor === 'green',
      yellow: timerStatus.lightColor === 'yellow',
      red: timerStatus.lightColor === 'red',
    };
  };

  const lights = getLightStates();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with settings button */}
      <View style={styles.header}>
        <Text style={styles.title}>BOXING TIMER</Text>
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          testID="settings-button"
        >
          <Ionicons name="settings-sharp" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Three-light system */}
      <View style={styles.lightsContainer}>
        <LightBeacon color="green" isOn={lights.green} />
        <LightBeacon color="yellow" isOn={lights.yellow} />
        <LightBeacon color="red" isOn={lights.red} />
      </View>

      {/* Progress ring */}
      <ProgressRing
        elapsed={timerStatus.elapsedSeconds}
        total={timerStatus.totalSeconds}
        displayTime={timerStatus.displayTime}
        ringColor={timerStatus.lightColor}
      />

      {/* Round info */}
      <Text style={styles.roundInfo} testID="round-info">{timerStatus.roundInfo}</Text>
      <Text style={styles.stateLabel}>{timerStatus.state.toUpperCase()}</Text>

      {/* Control buttons */}
      <View style={styles.buttonsContainer}>
        <PrimaryButton 
          label={getButtonLabel()} 
          onPress={handlePlayPause} 
          variant="primary"
          testID="play-pause-button"
        />

        <View style={styles.secondaryButtonsRow}>
          <PrimaryButton
            label="SKIP"
            onPress={skip}
            disabled={timerStatus.state === 'idle' || timerStatus.state === 'complete'}
            variant="secondary"
            testID="skip-button"
          />

          <PrimaryButton
            label="RESET"
            onPress={reset}
            disabled={timerStatus.state === 'idle'}
            variant="secondary"
            testID="reset-button"
          />
        </View>
      </View>

      {/* Info footer */}
      <Text style={styles.footer}>
        {timerStatus.isRunning ? 'Timer is running...' : 'Ready to train'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1B',
  },
  lightsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  roundInfo: {
    color: '#CCCCCC',
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  stateLabel: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 16,
    letterSpacing: 2,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginVertical: 16,
    gap: 12,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  footer: {
    color: '#666666',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
