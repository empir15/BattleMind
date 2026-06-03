// ============================================================
// BattleMind Mobile — Écran de Victoire (Victory Screen)
// Célèbre l'équipe gagnante du tournoi avec un visuel grandiose.
// ============================================================

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useRoomStore } from '../../stores/useRoomStore';
import { useGameStore } from '../../stores/useGameStore';
import { disconnectSocket } from '../../socket/socketClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Victory'>;

export default function VictoryScreen({ navigation, route }: Props): React.JSX.Element {
  const { winner } = route.params;
  const winnerColorValue = colors.teams[winner as keyof typeof colors.teams] || '#FFFFFF';

  const bounceAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de pulsation du trophée/couronne
    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0.95,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animation de rotation légère
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    ).start();
  }, [bounceAnim, rotateAnim]);

  const handleReturnHome = () => {
    // Déconnexion propre des sockets
    disconnectSocket();

    // Reset complet des stores
    useRoomStore.getState().resetRoom();
    useGameStore.getState().resetGame();

    navigation.replace('Home');
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Halo lumineux en arrière-plan */}
      <Animated.View
        style={[
          styles.glowBg,
          {
            backgroundColor: winnerColorValue,
            transform: [{ rotate: rotation }],
          },
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.congrats}>FÉLICITATIONS !</Text>

        <Animated.View style={[styles.trophyBox, { transform: [{ scale: bounceAnim }] }]}>
          <Text style={styles.trophy}>🏆</Text>
        </Animated.View>

        <Text style={[styles.winnerTitle, { color: winnerColorValue, textShadowColor: winnerColorValue }]}>
          ÉQUIPE {winner.toUpperCase()}
        </Text>
        
        <Text style={styles.victoryLabel}>CHAMPION DU TOURNOI BATTLEMIND</Text>

        <Text style={styles.outroDesc}>
          Vous avez vaincu vos adversaires grâce à votre intellect et votre sang-froid. La gloire vous appartient !
        </Text>

        <TouchableOpacity
          style={[styles.btnHome, { backgroundColor: winnerColorValue }]}
          onPress={handleReturnHome}
          activeOpacity={0.8}
        >
          <Text style={styles.btnHomeText}>RETOUR AU MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.15,
    filter: 'blur(50px)', // Supporté nativement sur certaines configurations, sinon l'opacité suffit
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 2,
  },
  congrats: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  trophyBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E2530',
    borderColor: '#233044',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  trophy: {
    fontSize: 70,
  },
  winnerTitle: {
    fontSize: 34,
    fontWeight: '950',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  victoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  outroDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  btnHome: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnHomeText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
