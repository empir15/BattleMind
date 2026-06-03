// ============================================================
// BattleMind Server — Match Handlers
// Relie les sockets clients aux fonctions du MatchEngine.
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import type { GameMode, QuestionCategory } from '@shared/game.types';
import {
  handleChooseMode,
  handleSubmitQuestion,
  handleValidateQuestion,
  handleSubmitAnswer,
  handleValidateAnswer,
  handleAuctionBid,
  handleAuctionPass,
} from '../game/MatchEngine';
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

export function registerMatchHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {
  // ── match:chooseMode ───────────────────────────────────────
  socket.on('match:chooseMode', (mode: GameMode) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: match:chooseMode', { roomCode, mode, player: socket.data.pseudo });
    handleChooseMode(io, roomCode, mode);
  });

  // ── match:submitQuestion ───────────────────────────────────
  socket.on('match:submitQuestion', (text: string, category: QuestionCategory) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: match:submitQuestion', { roomCode, category, player: socket.data.pseudo });
    handleSubmitQuestion(io, roomCode, text, category);
  });

  // ── judge:validateQuestion ─────────────────────────────────
  socket.on('judge:validateQuestion', (approved: boolean) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    if (socket.data?.role !== 'judge') {
      logger.warn('Non-judge tried to validate question', { roomCode, player: socket.data.pseudo });
      return;
    }

    logger.info('Action socket received: judge:validateQuestion', { roomCode, approved });
    handleValidateQuestion(io, roomCode, approved);
  });

  // ── match:submitAnswer ─────────────────────────────────────
  socket.on('match:submitAnswer', (answer: string) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: match:submitAnswer', { roomCode, player: socket.data.pseudo });
    handleSubmitAnswer(io, roomCode, socket.id, answer);
  });

  // ── judge:validateAnswer ───────────────────────────────────
  socket.on('judge:validateAnswer', (approved: boolean) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    if (socket.data?.role !== 'judge') {
      logger.warn('Non-judge tried to validate answer', { roomCode, player: socket.data.pseudo });
      return;
    }

    logger.info('Action socket received: judge:validateAnswer', { roomCode, approved });
    handleValidateAnswer(io, roomCode, approved);
  });

  // ── auction:bid ────────────────────────────────────────────
  socket.on('auction:bid', (amount: number) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    logger.info('Action socket received: auction:bid', { roomCode, amount, player: socket.data.pseudo });
    if (amount <= 0) {
      handleAuctionPass(io, roomCode, socket.id);
    } else {
      handleAuctionBid(io, roomCode, socket.id, amount);
    }
  });
}
