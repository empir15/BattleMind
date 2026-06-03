// ============================================================
// BattleMind Server — Lobby Handlers
// Gère : lobby:chooseTeam et lobby:ready (démarrage tournoi)
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import type { TeamColor } from '@shared/game.types';
import {
  getRoomByCode,
  assignTeam,
  getPlayers,
  getTeams,
  validateTeamsForStart,
  startTournament,
} from '../game/RoomManager';
import { logger } from '../logger/logger';

type BattleMindSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type BattleMindServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function registerLobbyHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {

  // ── lobby:chooseTeam ──────────────────────────────────────
  socket.on('lobby:chooseTeam', (teamColor: TeamColor) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    // Le juge ne peut pas rejoindre une équipe
    if (socket.data?.role === 'judge') {
      socket.emit('lobby:error', 'Le juge ne peut pas rejoindre une équipe.');
      return;
    }

    const result = assignTeam(socket.id, teamColor, roomCode);

    if (!result.success) {
      socket.emit(
        result.error === 'Cette équipe est pleine (max 5 joueurs).'
          ? 'lobby:teamFull'
          : 'lobby:error',
        teamColor,
      );
      return;
    }

    // Diffuse le lobby mis à jour à tous
    io.to(roomCode).emit(
      'lobby:updated',
      getPlayers(roomCode),
      getTeams(roomCode),
    );

    logger.info('Joueur a choisi une équipe', {
      roomCode,
      pseudo: socket.data?.pseudo,
      team: teamColor,
    });
  });

  // ── lobby:ready (Juge démarre le tournoi) ─────────────────
  socket.on('lobby:ready', () => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    // Seul le juge peut démarrer
    if (socket.data?.role !== 'judge') {
      socket.emit('lobby:error', 'Seul le juge peut démarrer la partie.');
      return;
    }

    const state = getRoomByCode(roomCode);
    if (!state) return;

    // Vérifie les contraintes d'équipe
    const validation = validateTeamsForStart(roomCode);
    if (!validation.valid) {
      socket.emit('lobby:error', validation.error);
      return;
    }

    // Génère le bracket et démarre le tournoi
    const bracket = startTournament(roomCode);
    if (!bracket) return;

    io.to(roomCode).emit('tournament:started', bracket);

    // Lance immédiatement le premier match (SF1 : Bleu vs Rouge)
    io.to(roomCode).emit('tournament:matchReady', bracket.semiFinal1);

    // Choisit aléatoirement l'équipe qui commence
    const startingTeam = Math.random() < 0.5
      ? bracket.semiFinal1.teamA
      : bracket.semiFinal1.teamB;

    io.to(roomCode).emit('match:modeRequest', startingTeam);

    logger.info('Tournoi démarré par le juge', {
      roomCode,
      firstMatch: `${bracket.semiFinal1.teamA} vs ${bracket.semiFinal1.teamB}`,
      startingTeam,
    });
  });
}
