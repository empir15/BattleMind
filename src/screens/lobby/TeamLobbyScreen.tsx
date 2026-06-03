// ============================================================
// BattleMind Mobile — Écran de Lobby des Équipes (Team Lobby)
// Permet aux Joueurs de choisir leur équipe (Bleu, Rouge, Jaune, Blanc)
// et d'attendre que le Juge lance le tournoi.
// ============================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useRoomStore } from '../../stores/useRoomStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { socket, disconnectSocket } from '../../socket/socketClient';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamLobby'>;

export default function TeamLobbyScreen({ navigation, route }: Props): React.JSX.Element {
  const { roomCode } = route.params;
  const players = useRoomStore((state) => state.players);
  const teams = useRoomStore((state) => state.teams);
  const currentPlayerId = useAuthStore((state) => state.playerId);

  const handleSelectTeam = (color: string) => {
    if (socket && socket.connected) {
      socket.emit('lobby:chooseTeam', color as any);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Quitter la salle ?',
      'Êtes-vous sûr de vouloir quitter le lobby de cette partie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
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

  // Trouver l'équipe actuelle du joueur
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const currentTeamColor = currentPlayer?.teamColor;

  const getPlayersByTeam = (color: string) => {
    return players.filter((p) => p.teamColor === color);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>LOBBY DE JEU</Text>
          <Text style={styles.playerStatus}>Pseudo : {currentPlayer?.pseudo}</Text>
        </View>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>CODE DE SALLE</Text>
          <Text style={styles.codeText}>{roomCode}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>REJOINDRE UNE ÉQUIPE (2 À 5 JOUEURS)</Text>

        <View style={styles.teamsGrid}>
          {teams.map((team) => {
            const teamPlayers = getPlayersByTeam(team.color);
            const isMyTeam = currentTeamColor === team.color;
            const teamColorValue = colors.teams[team.color as keyof typeof colors.teams] || '#FFFFFF';

            return (
              <TouchableOpacity
                key={team.color}
                style={[
                  styles.teamCard,
                  { borderColor: teamColorValue },
                  isMyTeam && styles.teamCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTeam(team.color)}
              >
                <View style={[styles.teamHeader, { backgroundColor: teamColorValue }]}>
                  <Text style={styles.teamName}>{team.color.toUpperCase()}</Text>
                  {isMyTeam && <Text style={styles.myTeamBadge}>VOTRE ÉQUIPE</Text>}
                  <Text style={styles.teamCount}>{teamPlayers.length}/5</Text>
                </View>

                <View style={styles.teamPlayersList}>
                  {teamPlayers.length === 0 ? (
                    <Text style={styles.emptyText}>Rejoindre cette équipe</Text>
                  ) : (
                    teamPlayers.map((player) => (
                      <Text
                        key={player.id}
                        style={[
                          styles.playerName,
                          player.id === currentPlayerId && styles.playerNameSelf,
                        ]}
                      >
                        {player.id === currentPlayerId ? '🟢 ' : '👤 '}
                        {player.pseudo} {player.isCaptain && '👑'}
                      </Text>
                    ))
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>En attente du lancement de la partie par le Juge...</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnLeave} onPress={handleLeave} activeOpacity={0.7}>
          <Text style={styles.btnLeaveText}>QUITTER LE LOBBY</Text>
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
  playerStatus: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
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
    color: colors.primary,
    letterSpacing: 2,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  teamsGrid: {
    gap: spacing.md,
  },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 100,
  },
  teamCardActive: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    backgroundColor: '#1E2530',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  myTeamBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  teamCount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  teamPlayersList: {
    padding: spacing.md,
    gap: 6,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerNameSelf: {
    fontWeight: '800',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  waitingContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
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
  },
  btnLeave: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  btnLeaveText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
