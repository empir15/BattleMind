// ============================================================
// BattleMind UI — LifeBar
// Affiche les vies (cœurs) avec des animations de battement.
// ============================================================

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, spacing } from '../../constants/theme';

interface LifeBarProps {
  lives: number;
  maxLives?: number;
  teamColor?: string;
}

export default function LifeBar({
  lives,
  maxLives = 2,
  teamColor = colors.danger,
}: LifeBarProps): React.JSX.Element {
  
  return (
    <View style={styles.container}>
      {Array.from({ length: maxLives }).map((_, index) => (
        <HeartIcon 
          key={index} 
          active={index < lives} 
          color={teamColor} 
        />
      ))}
    </View>
  );
}

function HeartIcon({ active, color }: { active: boolean; color: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 1 : 0.3,
  }));

  return (
    <Animated.View style={[styles.heartContainer, animatedStyle]}>
      <Text style={[styles.heart, { color: active ? color : '#4B5563' }]}>
        {active ? '❤️' : '🖤'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  heartContainer: {
    padding: 2,
  },
  heart: {
    fontSize: 20,
  },
});
