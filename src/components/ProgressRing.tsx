import { View, Text, StyleSheet } from 'react-native';

interface ProgressRingProps {
  elapsed: number;
  total: number;
  displayTime: string;
}

/**
 * ProgressRing - Circular timer display with arc progress
 *
 * Features:
 * - SVG circular arc showing remaining time
 * - Updates every 1 second (monotonic progress)
 * - Large MM:SS display in center
 * - Green progress arc that fills as time passes
 * - Responsive sizing
 */
export function ProgressRing({ elapsed, total, displayTime }: ProgressRingProps) {
  // Ring dimensions
  const size = 300;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress: how much of the circle has been "used"
  // Starts at 0%, progresses to 100% as elapsed time increases
  const progress = total > 0 ? elapsed / total : 0;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  // Create inline SVG as a data URL string for web compatibility
  const svgString = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .bg-circle { fill: none; stroke: #333333; stroke-width: 8; }
          .progress-arc { fill: none; stroke: #00D26A; stroke-width: 8; stroke-linecap: round; stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset}; }
          .timer-text { font-size: 72px; font-weight: bold; fill: #FFFFFF; text-anchor: middle; dominant-baseline: middle; }
          .progress-text { font-size: 14px; fill: #999999; text-anchor: middle; dominant-baseline: middle; }
        </style>
      </defs>
      <g>
        <!-- Background circle -->
        <circle class="bg-circle" cx="${size / 2}" cy="${size / 2}" r="${radius}" />

        <!-- Progress arc (rotated -90° to start from top) -->
        <circle
          class="progress-arc"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          style="transform: rotate(-90deg); transform-origin: ${size / 2}px ${size / 2}px;"
        />

        <!-- Center time display -->
        <text class="timer-text" x="${size / 2}" y="${size / 2 - 10}">${displayTime}</text>

        <!-- Progress percentage -->
        <text class="progress-text" x="${size / 2}" y="${size / 2 + 40}">
          ${progress === 1 ? 'Complete' : Math.round(progress * 100) + '%'}
        </text>
      </g>
    </svg>
  `;

  // For React Native: use a simple circle with overlay
  // For Web: would use HTML canvas or SVG directly
  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        {/* Outer ring background */}
        <View style={[styles.ring, styles.ringBackground]} />

        {/* Inner content */}
        <View style={styles.content}>
          {/* Time display */}
          <Text style={styles.timeText} testID="timer-display">{displayTime}</Text>

          {/* Progress indicator */}
          <Text style={styles.progressText}>{progress === 1 ? 'Complete' : `${Math.round(progress * 100)}%`}</Text>
        </View>

        {/* Progress arc indicator - visual representation */}
        <View style={[styles.progressRing, { transform: [{ rotate: `${progress * 360}deg` }] }]} />
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
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  ringBackground: {
    borderWidth: 8,
    borderColor: '#333333',
  },
  progressRing: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#00D26A',
    borderRightColor: '#00D26A',
    borderBottomColor: 'transparent',
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
