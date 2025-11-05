import { View, StyleSheet, ViewStyle } from 'react-native';

export type LightColor = 'red' | 'yellow' | 'green';

interface LightBeaconProps {
  color: LightColor;
  isOn: boolean;
}

const colorMap: Record<LightColor, string> = {
  red: '#FF4D4F',
  yellow: '#FFD84D',
  green: '#00D26A',
};

const shadowColorMap: Record<LightColor, string> = {
  red: '#FF4D4F40',
  yellow: '#FFD84D40',
  green: '#00D26A40',
};

/**
 * LightBeacon - Indicator light for timer states
 *
 * Features:
 * - Three colors: red (rest), yellow (final seconds), green (work)
 * - Glow effect when ON
 * - Dim/off opacity when not active
 * - Size 80x80 points
 */
export function LightBeacon({ color, isOn }: LightBeaconProps) {
  const lightColor = colorMap[color];
  const shadowColor = shadowColorMap[color];

  return (
    <View
      style={[
        styles.container,
        {
          opacity: isOn ? 1 : 0.3,
          // Add glow effect when on
          ...(isOn && {
            shadowColor: lightColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 12, // Android shadow
          }),
        } as ViewStyle,
      ]}
    >
      {/* Outer glow ring (when on) */}
      {isOn && <View style={[styles.glow, { borderColor: lightColor }]} />}

      {/* Main light circle */}
      <View style={[styles.light, { backgroundColor: lightColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  light: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    opacity: 0.5,
  },
});
