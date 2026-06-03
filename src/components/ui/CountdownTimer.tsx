// ============================================================
// BattleMind UI — CountdownTimer
// Affiche le temps restant avec un effet de pulsation d'urgence.
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing } from '../../constants/theme';

interface CountdownTimerProps {
  remainingTime: number;
  totalTime: number;
  phase?: string;
}

export default function CountdownTimer({
  remainingTime,
  totalTime,
  phase,
}: CountdownTimerProps): React.JSX.Element {
  
  const scale = useSharedValue(1);
  const isUrgent = remainingTime <= 5 && remainingTime > 0;

  React.useEffect(() => {
    if (isUrgent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 250 }),
          withTiming(1, { duration: 250 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [isUrgent]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = isUrgent ? colors.danger : colors.primary;
    return {
      color: color,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {phase && <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>}
      <View style={styles.timerCircle}>
        <Animated.Text style={[styles.timerText, animatedTextStyle]}>
          {remainingTime}
        </Animated.Text>
        <Text style={styles.secondsLabel}>SEC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  phaseText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  timerText: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondsLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
    position: 'absolute',
    bottom: 12,
  },
});
