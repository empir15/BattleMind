// ============================================================
// BattleMind Server — Joker Handlers
// Gère l'utilisation des jokers Temps et Indice.
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import { handleUseTimeJoker, handleUseHintJoker } from '../game/MatchEngine';
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

export function registerJokerHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {
  // ── joker:useTime ──────────────────────────────────────────
  socket.on('joker:useTime', () => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: joker:useTime', { roomCode, player: socket.data.pseudo });
    handleUseTimeJoker(io, roomCode, socket.id);
  });

  // ── joker:useHint ──────────────────────────────────────────
  socket.on('joker:useHint', () => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: joker:useHint', { roomCode, player: socket.data.pseudo });
    handleUseHintJoker(io, roomCode, socket.id);
  });
}
