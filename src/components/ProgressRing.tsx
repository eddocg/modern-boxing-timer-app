import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { LightColor } from '../types';

interface ProgressRingProps {
  elapsed: number;
  total: number;
  displayTime: string;
  ringColor: LightColor; // Color matches active phase light
}

/**
 * ProgressRing - Circular timer display with arc progress
 *
 * Features:
 * - SVG-based progress ring that starts full at 12 o'clock and decreases clockwise
 * - Large MM:SS display in center
 * - Ring color syncs with active phase light color
 * - Single source of truth: remaining time drives both visual and numeric display
 */
export function ProgressRing({ elapsed, total, displayTime, ringColor }: ProgressRingProps) {
  // Dimensions
  const size = 300;
  const radius = 130;
  const strokeWidth = 8;
  const center = size / 2;
  
  // Calculate circumference
  const circumference = 2 * Math.PI * radius;

  // Single source of truth: remaining from full→empty in [1..0]
  // Clamp strictly to prevent negative or >1 values
  const remaining = total > 0 ? Math.max(0, Math.min(1, (total - elapsed) / total)) : 0;
  
  // For clockwise decrease: negative dashoffset shrinks clockwise
  const dashoffset = -circumference * (1 - remaining);

  // Map light color to ring stroke color
  const strokeColorMap: Record<LightColor, string> = {
    green: '#00D26A',
    yellow: '#FFD84D',
    red: '#FF4D4F',
    off: '#333333',
  };
  const strokeColor = strokeColorMap[ringColor];

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#333333"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress arc - color matches active phase light */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.content}>
          <Text style={styles.timeText} testID="timer-display">{displayTime}</Text>
          <Text style={styles.progressText}>
            {remaining === 0 ? 'Complete' : `${Math.round(remaining * 100)}%`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  ringContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#999999',
  },
});
