// ============================================================
// BattleMind Mobile — Écran de Lobby du Juge (Judge Lobby)
// Affiche le code de la salle, les joueurs connectés,
// et permet au Juge de valider le lancement du tournoi.
// ============================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useRoomStore } from '../../stores/useRoomStore';
import { socket, disconnectSocket } from '../../socket/socketClient';

type Props = NativeStackScreenProps<RootStackParamList, 'JudgeLobby'>;

export default function JudgeLobbyScreen({ navigation, route }: Props): React.JSX.Element {
  const { roomCode } = route.params;
  const players = useRoomStore((state) => state.players);
  const teams = useRoomStore((state) => state.teams);

  const handleStartTournament = () => {
    if (socket && socket.connected) {
      socket.emit('lobby:ready');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Fermer la salle ?',
      'Si vous quittez, la salle sera supprimée et tous les joueurs seront déconnectés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fermer',
          style: 'destructive',
          onPress: () => {
            disconnectSocket();
            useRoomStore.getState().resetRoom();
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  // Grouper les joueurs par équipe
  const getPlayersByTeam = (color: string) => {
    return players.filter((p) => p.teamColor === color);
  };

  const unassignedPlayers = players.filter((p) => !p.teamColor && p.role !== 'judge');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SALLE DU JUGE</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>CODE DE JEU</Text>
          <Text style={styles.codeText}>{roomCode}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Résumé des effectifs */}
        <Text style={styles.sectionTitle}>ÉQUIPES DU TOURNOI (MIN 2 JOUEURS CHACUNE)</Text>

        <View style={styles.grid}>
          {teams.map((team) => {
            const teamPlayers = getPlayersByTeam(team.color);
            const teamColorValue = colors.teams[team.color as keyof typeof colors.teams] || '#FFFFFF';

            return (
              <View key={team.color} style={[styles.teamCard, { borderColor: teamColorValue }]}>
                <View style={[styles.teamHeader, { backgroundColor: teamColorValue }]}>
                  <Text style={styles.teamName}>{team.color.toUpperCase()}</Text>
                  <Text style={styles.teamCount}>{teamPlayers.length}/5</Text>
                </View>
                <View style={styles.teamPlayersList}>
                  {teamPlayers.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun joueur</Text>
                  ) : (
                    teamPlayers.map((player) => (
                      <Text key={player.id} style={styles.playerName}>
                        👤 {player.pseudo} {player.isCaptain && '👑'}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Joueurs non assignés */}
        {unassignedPlayers.length > 0 && (
          <View style={styles.unassignedBox}>
            <Text style={styles.sectionTitle}>SANS ÉQUIPE ({unassignedPlayers.length})</Text>
            <View style={styles.unassignedList}>
              {unassignedPlayers.map((player) => (
                <View key={player.id} style={styles.unassignedChip}>
                  <Text style={styles.unassignedText}>{player.pseudo}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer fixe boutons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnStart}
          onPress={handleStartTournament}
          activeOpacity={0.8}
        >
          <Text style={styles.btnStartText}>LANCER LE TOURNOI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLeave} onPress={handleLeave} activeOpacity={0.7}>
          <Text style={styles.btnLeaveText}>FERMER LA SALLE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: '#233044',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  codeBox: {
    alignItems: 'flex-end',
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '950',
    color: colors.secondary,
    letterSpacing: 2,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 150, // Laisse de la place pour le footer fixe
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  teamCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 120,
    marginBottom: spacing.sm,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  teamCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  teamPlayersList: {
    padding: spacing.sm,
    gap: 4,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  unassignedBox: {
    marginTop: spacing.lg,
    backgroundColor: '#161B22',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderColor: '#233044',
    borderWidth: 1,
  },
  unassignedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  unassignedChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  unassignedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: '#233044',
    gap: spacing.sm,
  },
  btnStart: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnStartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  btnLeave: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  btnLeaveText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
