import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@components/PrimaryButton';
import { useSettingsStore } from '@state/useSettings';

/**
 * SettingsScreen - Configuration for timer settings
 *
 * Features:
 * - Work/Rest duration configuration
 * - Yellow threshold (final seconds warning)
 * - Rounds (infinite or fixed)
 * - Sound pack selection
 * - Volume control
 * - Toggles for vibration and countdown
 */
export default function SettingsScreen() {
  const router = useRouter();
  const {
    workDuration,
    restDuration,
    yellowThreshold,
    vibrationEnabled,
    countdownEnabled,
    updateSetting,
    resetToDefaults,
  } = useSettingsStore();

  const handleClose = () => {
    router.back();
  };

  const formatSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Durations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Durations</Text>

        <View style={styles.setting}>
          <Text style={styles.label}>Work Duration: {formatSeconds(workDuration)}</Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('workDuration', Math.max(10, workDuration - 30))}
            >
              <Text style={styles.adjustButtonText}>-30s</Text>
            </Pressable>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('workDuration', workDuration + 30)}
            >
              <Text style={styles.adjustButtonText}>+30s</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Rest Duration: {formatSeconds(restDuration)}</Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('restDuration', Math.max(5, restDuration - 15))}
            >
              <Text style={styles.adjustButtonText}>-15s</Text>
            </Pressable>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('restDuration', restDuration + 15)}
            >
              <Text style={styles.adjustButtonText}>+15s</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Yellow Warning (Final {yellowThreshold}s)</Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('yellowThreshold', Math.max(1, yellowThreshold - 5))}
            >
              <Text style={styles.adjustButtonText}>-5s</Text>
            </Pressable>
            <Pressable
              style={styles.adjustButton}
              onPress={() => updateSetting('yellowThreshold', yellowThreshold + 5)}
            >
              <Text style={styles.adjustButtonText}>+5s</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Toggles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Options</Text>

        <View style={styles.toggle}>
          <Text style={styles.label}>Vibration</Text>
          <Switch
            value={vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            thumbColor={vibrationEnabled ? '#00D26A' : '#666666'}
            trackColor={{ false: '#333333', true: '#00D26A40' }}
          />
        </View>

        <View style={styles.toggle}>
          <Text style={styles.label}>3-2-1 Countdown</Text>
          <Switch
            value={countdownEnabled}
            onValueChange={(value) => updateSetting('countdownEnabled', value)}
            thumbColor={countdownEnabled ? '#00D26A' : '#666666'}
            trackColor={{ false: '#333333', true: '#00D26A40' }}
          />
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.infoText}>Boxing Timer v0.1.0</Text>
        <Text style={styles.infoText}>Phase 1: Core MVP</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <PrimaryButton label="Reset to Defaults" onPress={resetToDefaults} variant="secondary" />
        <PrimaryButton label="Done" onPress={handleClose} variant="primary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1A1A1B',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  setting: {
    marginBottom: 16,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#222222',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    color: '#00D26A',
    fontSize: 13,
    fontWeight: '600',
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1B',
  },
  infoText: {
    color: '#999999',
    fontSize: 13,
    marginVertical: 6,
  },
  buttonGroup: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
});
