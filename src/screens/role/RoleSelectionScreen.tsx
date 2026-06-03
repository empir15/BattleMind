// ============================================================
// BattleMind Mobile — Sélection du Rôle (Role Selection Screen)
// Permet de choisir entre héberger (Juge) et rejoindre (Joueur).
// ============================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { serverConfig } from '../../config/serverConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen({ navigation }: Props): React.JSX.Element {
  const pseudo = serverConfig.getLastPseudo();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>BIENVENUE,</Text>
        <Text style={styles.pseudo}>{pseudo.toUpperCase()}</Text>
        <Text style={styles.instruction}>CHOISISSEZ VOTRE RÔLE POUR CE TOURNOI</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Rôle Juge (Violet) */}
        <TouchableOpacity
          style={[styles.roleCard, styles.judgeCard]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateRoom')}
        >
          <View style={styles.badgeJudge}>
            <Text style={styles.badgeText}>ADMINISTRATEUR</Text>
          </View>
          <Text style={styles.roleTitleJudge}>LE JUGE</Text>
          <Text style={styles.roleDescription}>
            Crée la salle de jeu. Valide les questions créées par les joueurs et juge la validité des réponses. Dirige le rythme du tournoi.
          </Text>
          <View style={styles.actionButtonJudge}>
            <Text style={styles.actionButtonText}>CRÉER UNE SALLE</Text>
          </View>
        </TouchableOpacity>

        {/* Rôle Joueur (Cyan) */}
        <TouchableOpacity
          style={[styles.roleCard, styles.playerCard]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JoinRoom')}
        >
          <View style={styles.badgePlayer}>
            <Text style={styles.badgeText}>COMPÉTITEUR</Text>
          </View>
          <Text style={styles.roleTitlePlayer}>JOUEUR</Text>
          <Text style={styles.roleDescription}>
            Rejoint une équipe. Propose des questions coriaces à l'adversaire. Enchérit et répond en direct sous pression du chrono !
          </Text>
          <View style={styles.actionButtonPlayer}>
            <Text style={styles.actionButtonText}>REJOINDRE UNE SALLE</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>MODIFIER PSEUDO / IP SERVEUR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcome: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 2,
  },
  pseudo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
  instruction: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    elevation: 5,
  },
  judgeCard: {
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  playerCard: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  badgeJudge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: spacing.sm,
  },
  badgePlayer: {
    backgroundColor: 'rgba(0, 255, 212, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  roleTitleJudge: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  roleTitlePlayer: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  actionButtonJudge: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonPlayer: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  backLink: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    padding: spacing.sm,
  },
  backText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
