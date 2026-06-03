// ============================================================
// BattleMind Mobile — Écran de l'Arbre du Tournoi (Tournament Bracket)
// Affiche graphiquement l'évolution des matchs (demi-finales, finale).
// ============================================================

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useGameStore } from '../../stores/useGameStore';
import type { Match } from '@shared/game.types';

export default function TournamentBracketScreen(): React.JSX.Element {
  const bracket = useGameStore((state) => state.bracket);

  if (!bracket) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initialisation du tournoi...</Text>
      </View>
    );
  }

  const renderMatchCard = (match: Match, label: string) => {
    const isOngoing = match.status === 'ongoing';
    const isFinished = match.status === 'finished';

    const colorA = colors.teams[match.teamA as keyof typeof colors.teams] || '#FFFFFF';
    const colorB = colors.teams[match.teamB as keyof typeof colors.teams] || '#FFFFFF';

    const isWinnerA = match.winnerId === match.teamA;
    const isWinnerB = match.winnerId === match.teamB;

    return (
      <View style={[styles.matchCard, isOngoing && styles.matchCardOngoing]}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchLabel}>{label.toUpperCase()}</Text>
          {isOngoing && <Text style={styles.ongoingBadge}>EN COURS</Text>}
          {isFinished && <Text style={styles.finishedBadge}>TERMINÉ</Text>}
        </View>

        <View style={styles.teamsList}>
          {/* Équipe A */}
          <View style={styles.teamRow}>
            <View style={[styles.colorIndicator, { backgroundColor: colorA }]} />
            <Text
              style={[
                styles.teamName,
                isFinished && !isWinnerA && styles.lostTeam,
                isWinnerA && styles.winnerTeam,
              ]}
            >
              ÉQUIPE {match.teamA.toUpperCase()}
            </Text>
            {isWinnerA && <Text style={styles.crown}>👑</Text>}
          </View>

          <View style={styles.vsLine}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Équipe B */}
          <View style={styles.teamRow}>
            <View style={[styles.colorIndicator, { backgroundColor: colorB }]} />
            <Text
              style={[
                styles.teamName,
                isFinished && !isWinnerB && styles.lostTeam,
                isWinnerB && styles.winnerTeam,
              ]}
            >
              ÉQUIPE {match.teamB.toUpperCase()}
            </Text>
            {isWinnerB && <Text style={styles.crown}>👑</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ARBRE DU TOURNOI</Text>
        <Text style={styles.subtitle}>EN ROUTE POUR LA GLOIRE</Text>
      </View>

      <View style={styles.bracketLayout}>
        {/* Colonne Demi-finales */}
        <View style={styles.column}>
          <Text style={styles.colTitle}>DEMI-FINALES</Text>
          {renderMatchCard(bracket.semiFinal1, 'Demi-finale 1')}
          <View style={styles.colSpacing} />
          {renderMatchCard(bracket.semiFinal2, 'Demi-finale 2')}
        </View>

        {/* Lignes de liaison visuelles */}
        <View style={styles.connectionColumn}>
          <View style={styles.connectLineTop} />
          <View style={styles.connectLineMiddle} />
          <View style={styles.connectLineBottom} />
        </View>

        {/* Colonne Finale */}
        <View style={styles.column}>
          <Text style={styles.colTitle}>FINALE</Text>
          {bracket.final ? (
            renderMatchCard(bracket.final, 'Grande Finale')
          ) : (
            <View style={styles.matchCardPending}>
              <Text style={styles.pendingText}>EN ATTENTE DES VAINQUEURS</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  bracketLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    width: '45%',
    gap: spacing.md,
  },
  colTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  colSpacing: {
    height: spacing.xl,
  },
  matchCard: {
    backgroundColor: colors.surface,
    borderColor: '#233044',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  matchCardOngoing: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  matchCardPending: {
    backgroundColor: 'rgba(22, 27, 34, 0.5)',
    borderColor: '#1F2530',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
    lineHeight: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#233044',
    paddingBottom: 6,
    marginBottom: spacing.sm,
  },
  matchLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  ongoingBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  finishedBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: '#4B5563',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  teamsList: {
    gap: spacing.xs,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lostTeam: {
    color: '#4B5563',
    textDecorationLine: 'line-through',
  },
  winnerTeam: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  crown: {
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  vsLine: {
    paddingLeft: 16,
    marginVertical: 1,
  },
  vsText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  connectionColumn: {
    width: '10%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  connectLineTop: {
    position: 'absolute',
    top: 40,
    right: 0,
    left: '50%',
    height: 2,
    backgroundColor: '#233044',
  },
  connectLineMiddle: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: '50%',
    width: 2,
    backgroundColor: '#233044',
  },
  connectLineBottom: {
    position: 'absolute',
    bottom: 40,
    right: 0,
    left: '50%',
    height: 2,
    backgroundColor: '#233044',
  },
});
