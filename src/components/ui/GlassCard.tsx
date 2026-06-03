// ============================================================
// BattleMind UI — GlassCard
// Carte avec effet de verre translucide et bordure fine.
// ============================================================

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  withDelay
} from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export default function GlassCard({
  children,
  style,
  delay = 0,
}: GlassCardProps): React.JSX.Element {
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(22, 27, 34, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
