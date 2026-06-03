// ============================================================
// BattleMind Mobile — Écouteurs d'Événements Socket.IO
// Met à jour les stores Zustand et pilote les navigations.
// ============================================================

import { Alert } from 'react-native';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/socket.types';
import { useAuthStore } from '../stores/useAuthStore';
import { useRoomStore } from '../stores/useRoomStore';
import { useGameStore } from '../stores/useGameStore';
import { navigate } from '../navigation/navigationRef';

/**
 * Configure tous les écouteurs d'événements réseau émis par le serveur Node.js.
 */
export function setupSocketListeners(
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
): void {
  // Nettoie les écouteurs existants pour éviter les doublons lors des reconnexions
  socket.off();

  // ── Auth ────────────────────────────────────────────────────
  socket.on('auth:success', (player) => {
    useAuthStore.getState().setAuth(player);
    console.log('[SocketEvent] Authentification réussie avec UUID :', player.id);
  });

  socket.on('auth:error', (reason) => {
    Alert.alert('Erreur d\'identification', reason);
  });

  // ── Salle ───────────────────────────────────────────────────
  socket.on('room:created', (room) => {
    useRoomStore.getState().setRoom(room);
    navigate('JudgeLobby', { roomCode: room.code });
  });

  socket.on('room:joined', (room, player) => {
    useRoomStore.getState().setRoom(room);
    navigate('TeamLobby', { roomCode: room.code });
  });

  socket.on('room:error', (message) => {
    Alert.alert('Problème de salle', message);
  });

  // ── Lobby ───────────────────────────────────────────────────
  socket.on('lobby:updated', (players, teams) => {
    useRoomStore.getState().updateLobby(players, teams);
  });

  socket.on('lobby:teamFull', (teamColor) => {
    Alert.alert('Équipe saturée', `L'équipe ${teamColor.toUpperCase()} a atteint le nombre maximum de joueurs.`);
  });

  socket.on('lobby:error', (message) => {
    Alert.alert('Lobby', message);
  });

  // ── Tournoi ─────────────────────────────────────────────────
  socket.on('tournament:started', (bracket) => {
    useGameStore.getState().setBracket(bracket);
    navigate('TournamentBracket');
  });

  socket.on('tournament:matchReady', (match) => {
    useGameStore.getState().setCurrentMatch(match);
    // Laisse voir le bracket 2 secondes puis envoie au match / panel juge
    setTimeout(() => {
      const role = useAuthStore.getState().role;
      if (role === 'judge') {
        navigate('JudgeControl');
      } else {
        navigate('Match');
      }
    }, 2000);
  });

  socket.on('tournament:updated', (bracket) => {
    useGameStore.getState().setBracket(bracket);
  });

  socket.on('tournament:finished', (winner) => {
    useGameStore.getState().setTournamentFinished(winner);
    navigate('Victory', { winner });
  });

  // ── Match — Étapes ──────────────────────────────────────────
  socket.on('match:modeRequest', (activeTeam) => {
    const currentMatch = useGameStore.getState().currentMatch;
    if (currentMatch) {
      useGameStore.getState().setCurrentMatch({
        ...currentMatch,
        activeTeam,
        currentMode: null,
      });
    }
  });

  socket.on('match:modeChosen', (mode) => {
    useGameStore.getState().setModeChosen(mode);
  });

  socket.on('match:questionRequest', (adverseTeam) => {
    useGameStore.getState().setQuestionRequest(adverseTeam);
  });

  socket.on('match:questionPending', (question) => {
    useGameStore.getState().setQuestionPending(question);
  });

  socket.on('match:questionValidated', (question) => {
    useGameStore.getState().setQuestionValidated(question);
  });

  socket.on('match:questionRefused', () => {
    Alert.alert('Question Rejetée', 'Le juge a refusé cette question. Proposition d\'une nouvelle...');
  });

  socket.on('match:respondentChosen', (playerId) => {
    // Stockage optionnel pour l'affichage de qui répond
  });

  socket.on('match:answerSubmitted', (playerId) => {
    // Un joueur a répondu, le juge examine
  });

  socket.on('match:answerValidated', (correct) => {
    // Flash vert / rouge sur les clients
  });

  socket.on('match:answerRefused', (attemptsLeft) => {
    useGameStore.getState().setAttemptsLeft(attemptsLeft);
    if (attemptsLeft > 0) {
      Alert.alert('Réponse incorrecte', `Il reste ${attemptsLeft} tentative(s) pour votre équipe.`);
    }
  });

  socket.on('match:lifeUpdate', (teamColor, lives) => {
    const { teams, players } = useRoomStore.getState();
    const updated = teams.map((t) => (t.color === teamColor ? { ...t, lives } : t));
    useRoomStore.getState().updateLobby(players, updated);
  });

  socket.on('match:teamEliminated', (teamColor) => {
    Alert.alert('Élimination !', `L'équipe ${teamColor.toUpperCase()} a perdu toutes ses vies.`);
  });

  socket.on('match:roundResult', (winner) => {
    // Fin de manche
  });

  // ── Chronomètre ─────────────────────────────────────────────
  socket.on('match:timerStart', (duration, phase) => {
    useGameStore.getState().setTimerStart(duration, phase);
  });

  socket.on('match:timerUpdate', (remaining) => {
    useGameStore.getState().setTimerUpdate(remaining);
  });

  socket.on('match:timerEnd', () => {
    useGameStore.getState().setTimerEnd();
  });

  // ── Enchères ────────────────────────────────────────────────
  socket.on('auction:bidUpdate', (teamColor, amount) => {
    useGameStore.getState().setBidUpdate(teamColor, amount);
  });

  socket.on('auction:bidTurn', (teamColor, timeLeft) => {
    useGameStore.getState().setBidTurn(teamColor, timeLeft);
  });

  socket.on('auction:won', (teamColor, amount) => {
    useGameStore.getState().setAuctionWon(teamColor, amount);
  });

  // ── Jokers ──────────────────────────────────────────────────
  socket.on('joker:timeAdded', (teamColor, newDuration) => {
    const currentPhase = useGameStore.getState().timerPhase;
    useGameStore.getState().setTimerStart(newDuration, currentPhase || 'discussion');
    Alert.alert('Joker Temps !', `L'équipe ${teamColor.toUpperCase()} a ajouté 10 secondes.`);
  });

  socket.on('joker:hintRevealed', (hint) => {
    const currentQuestion = useGameStore.getState().currentQuestion;
    if (currentQuestion) {
      useGameStore.getState().setQuestionValidated({
        ...currentQuestion,
        hint,
      });
    }
  });

  socket.on('joker:error', (message) => {
    Alert.alert('Action Joker refusée', message);
  });

  // ── Chat ────────────────────────────────────────────────────
  socket.on('chat:message', (msg) => {
    useGameStore.getState().addChatMessage(msg);
  });

  // ── Système ─────────────────────────────────────────────────
  socket.on('judge:disconnected', () => {
    Alert.alert('Juge déconnecté', 'Le juge a quitté la salle. Retour au menu principal.', [
      {
        text: 'Retour',
        onPress: () => {
          useRoomStore.getState().resetRoom();
          useGameStore.getState().resetGame();
          navigate('Home');
        },
      },
    ]);
  });

  socket.on('player:disconnected', (playerId) => {
    // Gérer visuellement si nécessaire
  });
}
