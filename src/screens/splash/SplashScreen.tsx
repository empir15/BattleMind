// ============================================================
// BattleMind Mobile — Écran de Chargement (Splash Screen)
// Affiche le logo animé et initialise l'identité visuelle.
// ============================================================

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props): React.JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Animation d'apparition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirection après 2.5 secondes
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Titre principale Cyberpunk */}
        <Text style={styles.cyberText}>BATTLE</Text>
        <Text style={styles.mindText}>MIND</Text>
        
        {/* Ligne néon lumineuse */}
        <View style={styles.neonLine} />
        
        <Text style={styles.tagline}>COMPETITIVE TRIVIA LAN</Text>
      </Animated.View>

      <Text style={styles.version}>v1.0.0 — MVP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyberText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  mindText: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginTop: -10,
  },
  neonLine: {
    width: 180,
    height: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    marginVertical: 15,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 4,
    textShadowColor: colors.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
