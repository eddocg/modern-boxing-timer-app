import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useState } from 'react';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

/**
 * PrimaryButton - Main action button for timer controls
 *
 * Features:
 * - Play/Pause/Resume button
 * - Disabled state support
 * - Visual feedback on press
 * - Two variants: primary (blue) and secondary (gray)
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle: (ViewStyle | false)[] = [
    styles.button,
    isPressed && styles.pressed,
    disabled && styles.disabled,
    variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
  ];

  const textStyle: (TextStyle | false)[] = [styles.text, disabled && styles.disabledText];

  return (
    <Pressable
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={disabled ? 'Button is disabled' : undefined}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    marginVertical: 8,
  },
  buttonPrimary: {
    backgroundColor: '#4A90E2',
  },
  buttonSecondary: {
    backgroundColor: '#666666',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: '#444444',
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.6,
  },
});
