// ============================================================
// BattleMind Server — Room Handlers
// Gère : room:create et room:join
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import type { Player } from '@shared/game.types';
import { authenticatePlayer } from '../auth/playerAuth';
import { generateRoomCode } from '../utils/generateRoomCode';
import {
  createRoom,
  getRoomByCode,
  addPlayer,
  getPlayers,
  getTeams,
  removePlayer,
  deleteRoom,
} from '../game/RoomManager';
import { registerHeartbeat } from './heartbeatHandlers';
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

export function registerRoomHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {

  // ── room:create (Juge uniquement) ──────────────────────────
  socket.on('room:create', (pseudo: string, questionMode: 'free' | 'official') => {
    const auth = authenticatePlayer(pseudo, 'judge', []);
    if (!auth.success) {
      socket.emit('auth:error', auth.error);
      return;
    }

    // Génère un code unique non utilisé
    let code = generateRoomCode();
    while (getRoomByCode(code)) {
      code = generateRoomCode();
    }

    // Crée la salle
    const state = createRoom(code, socket.id, questionMode);

    // Crée le joueur Juge
    const judge: Player = {
      id: auth.playerId,
      pseudo,
      teamColor: null,
      isCaptain: false,
      role: 'judge',
      socketId: socket.id,
    };

    // Attache les données au socket
    socket.data = {
      playerId: auth.playerId,
      pseudo,
      role: 'judge',
      roomCode: code,
    };

    addPlayer(code, judge);
    socket.join(code);

    socket.emit('auth:success', judge);
    socket.emit('room:created', state.room);

    // Démarre la surveillance heartbeat
    registerHeartbeat(socket);

    logger.info('Salle créée par le Juge', {
      roomCode: code,
      pseudo,
      questionMode,
    });
  });

  // ── room:join (Joueurs) ────────────────────────────────────
  socket.on('room:join', (code: string, pseudo: string) => {
    const state = getRoomByCode(code);
    if (!state) {
      socket.emit('room:error', 'Salle introuvable. Vérifiez le code.');
      return;
    }

    if (state.room.status !== 'waiting') {
      socket.emit('room:error', 'La partie est déjà en cours.');
      return;
    }

    // Vérifie les pseudos existants dans la salle
    const existingPseudos = getPlayers(code).map(p => p.pseudo);
    const auth = authenticatePlayer(pseudo, 'player', existingPseudos);

    if (!auth.success) {
      socket.emit('auth:error', auth.error);
      return;
    }

    const player: Player = {
      id: auth.playerId,
      pseudo,
      teamColor: null,
      isCaptain: false,
      role: 'player',
      socketId: socket.id,
    };

    socket.data = {
      playerId: auth.playerId,
      pseudo,
      role: 'player',
      roomCode: code,
    };

    addPlayer(code, player);
    socket.join(code);

    socket.emit('auth:success', player);
    socket.emit('room:joined', state.room, player);

    // Informe tous les joueurs du lobby mis à jour
    io.to(code).emit(
      'lobby:updated',
      getPlayers(code),
      getTeams(code),
    );

    // Démarre la surveillance heartbeat
    registerHeartbeat(socket);

    logger.info('Joueur a rejoint la salle', {
      roomCode: code,
      pseudo,
      socketId: socket.id,
    });
  });

  // ── Déconnexion ───────────────────────────────────────────
  socket.on('disconnect', () => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    const isJudge = socket.data?.role === 'judge';

    if (isJudge) {
      // Le juge quitte → fin de partie pour tous
      io.to(roomCode).emit('judge:disconnected');
      deleteRoom(roomCode);
      logger.warn('Juge déconnecté — partie terminée et salle supprimée', {
        roomCode,
        pseudo: socket.data?.pseudo,
      });
    } else {
      // Un joueur quitte → notifier les autres et le retirer du manager
      removePlayer(socket.id);
      io.to(roomCode).emit('player:disconnected', socket.data.playerId);
      io.to(roomCode).emit(
        'lobby:updated',
        getPlayers(roomCode),
        getTeams(roomCode),
      );
      logger.warn('Joueur déconnecté et retiré', {
        roomCode,
        pseudo: socket.data?.pseudo,
      });
    }
  });
}
