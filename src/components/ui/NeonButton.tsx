// ============================================================
// BattleMind UI — NeonButton
// Bouton avec effet de lueur néon et animations fluides.
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function NeonButton({
  title,
  onPress,
  variant = 'primary',
  color,
  style,
  textStyle,
  disabled = false,
}: NeonButtonProps): React.JSX.Element {
  
  // Déterminer la couleur de base
  const baseColor = color || colors[variant] || colors.primary;
  
  // Animation de "souffle" (glow)
  const glowOpacity = useSharedValue(0.6);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowRadius: glowOpacity.value * 10,
    elevation: glowOpacity.value * 5,
  }));

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        { borderColor: baseColor, shadowColor: baseColor },
        disabled && styles.disabled,
        animatedGlow,
        animatedScale,
        style,
      ]}
    >
      <Text style={[styles.text, { color: baseColor }, textStyle]}>
        {title.toUpperCase()}
      </Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    marginVertical: spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
    borderColor: '#4B5563',
    shadowColor: 'transparent',
  },
});
