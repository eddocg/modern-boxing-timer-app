import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useEffect, useState, useRef } from 'react';
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
 * - Large MM:SS display in center with fixed width to prevent jitter
 * - Ring color syncs with active phase light color
 * - Smooth 60 FPS animation interpolated from 1 Hz logic updates
 * - GPU-friendly: only animates strokeDashoffset (transform-like property)
 * - Pauses animation when tab is hidden (web only)
 */
export function ProgressRing({ elapsed, total, displayTime, ringColor }: ProgressRingProps) {
  // Dimensions
  const size = 300;
  const radius = 130;
  const strokeWidth = 8;
  const center = size / 2;
  
  // Calculate circumference
  const circumference = 2 * Math.PI * radius;

  // Smooth animation: interpolate between discrete 1 Hz updates
  // Use local state for smooth 60 FPS visual updates
  const [animatedElapsed, setAnimatedElapsed] = useState(elapsed);
  const lastUpdateRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Handle visibility changes (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      if (isVisibleRef.current) {
        // Resume animation when visible
        lastUpdateRef.current = performance.now();
        if (!animationFrameRef.current) {
          const animate = () => {
            if (!isVisibleRef.current) {
              animationFrameRef.current = null;
              return;
            }

            const now = performance.now();
            const deltaTime = (now - lastUpdateRef.current) / 1000;
            lastUpdateRef.current = now;

            setAnimatedElapsed((prev) => {
              const target = elapsed;
              const diff = target - prev;
              
              if (Math.abs(diff) < 0.01) {
                return target;
              }
              
              const factor = Math.min(1, deltaTime * 10);
              return prev + diff * factor;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      } else {
        // Pause animation when hidden - cancel RAF but keep state
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // Snap to target when hidden to avoid drift
        setAnimatedElapsed(elapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [elapsed]);

  // Main animation loop
  useEffect(() => {
    // Reset animation when elapsed prop changes (new phase or manual update)
    setAnimatedElapsed(elapsed);
    lastUpdateRef.current = performance.now();

    // Start smooth animation loop (~60 FPS)
    const animate = () => {
      // Skip if hidden (web only)
      if (Platform.OS === 'web' && typeof document !== 'undefined' && !isVisibleRef.current) {
        animationFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      setAnimatedElapsed((prev) => {
        // Smoothly interpolate towards target elapsed
        const target = elapsed;
        const diff = target - prev;
        
        // If close enough, snap to target
        if (Math.abs(diff) < 0.01) {
          return target;
        }
        
        // Otherwise, interpolate smoothly (ease towards target)
        // Use a small factor to avoid overshooting
        const factor = Math.min(1, deltaTime * 10); // Adjust speed as needed
        return prev + diff * factor;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [elapsed]);

  // Single source of truth: remaining from full→empty in [1..0]
  // Clamp strictly to prevent negative or >1 values
  const remaining = total > 0 ? Math.max(0, Math.min(1, (total - animatedElapsed) / total)) : 0;
  
  // For clockwise decrease: negative dashoffset shrinks clockwise
  // strokeDashoffset is transform-like (GPU-friendly, no layout)
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
          {/* strokeDashoffset is GPU-friendly (transform-like, no layout reflow) */}
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
          {/* Fixed-width container prevents text jitter from proportional digits */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText} testID="timer-display">{displayTime}</Text>
          </View>
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
  timeContainer: {
    // Fixed width prevents jitter: widest expected text is "99:59" (5 chars + colon)
    // Using monospace font ensures consistent width per digit
    width: 200, // Fixed width for MM:SS format (72px font * ~2.5 chars width)
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Platform.select({
      web: 'monospace', // Monospace prevents digit width variation
      default: 'monospace', // React Native monospace fallback
    }),
    textAlign: 'center',
    // Ensure consistent rendering
    ...(Platform.OS === 'web' && {
      fontVariantNumeric: 'tabular-nums', // Web: tabular numbers for consistent width
      letterSpacing: 0, // Prevent spacing adjustments
    }),
  },
  progressText: {
    fontSize: 14,
    color: '#999999',
  },
});
