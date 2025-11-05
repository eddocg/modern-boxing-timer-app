import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProgressRing } from '@components/ProgressRing';
import { LightBeacon } from '@components/LightBeacon';
import { PrimaryButton } from '@components/PrimaryButton';

import { useTimerStatus, useTimerActions } from '@state/timerMachine';
import { useSettingsStore } from '@state/useSettings';

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
  const { start, pause, resume, reset } = useTimerActions();

  // Settings
  const rounds = useSettingsStore((state) => state.rounds);
  const workDuration = useSettingsStore((state) => state.workDuration);
  const restDuration = useSettingsStore((state) => state.restDuration);
  const yellowThreshold = useSettingsStore((state) => state.yellowThreshold);

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
      />

      {/* Round info */}
      <Text style={styles.roundInfo}>{timerStatus.roundInfo}</Text>
      <Text style={styles.stateLabel}>{timerStatus.state.toUpperCase()}</Text>

      {/* Control buttons */}
      <View style={styles.buttonsContainer}>
        <PrimaryButton label={getButtonLabel()} onPress={handlePlayPause} variant="primary" />

        <PrimaryButton
          label="RESET"
          onPress={reset}
          disabled={timerStatus.state === 'idle'}
          variant="secondary"
        />
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
  footer: {
    color: '#666666',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
