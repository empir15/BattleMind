// ============================================================
// BattleMind Server — Chat Handlers
// Gère le chat privé par équipe.
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import type { ChatMessage } from '@shared/game.types';
import { getRoomByCode } from '../game/RoomManager';
import { logger } from '../logger/logger';
import { v4 as uuidv4 } from 'uuid';

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

export function registerChatHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {
  // ── chat:send (Message d'équipe) ──────────────────────────
  socket.on('chat:send', (text: string) => {
    const roomCode = socket.data?.roomCode;
    if (!roomCode) return;

    const roomState = getRoomByCode(roomCode);
    if (!roomState) return;

    const player = roomState.players.get(socket.id);
    if (!player || !player.teamColor) {
      logger.warn('Joueur hors équipe ou inconnu tente d\'envoyer un message chat', {
        socketId: socket.id,
        pseudo: socket.data?.pseudo,
      });
      return;
    }

    const teamColor = player.teamColor;
    const msg: ChatMessage = {
      id: uuidv4(),
      senderPseudo: player.pseudo,
      teamColor,
      text,
      timestamp: Date.now(),
    };

    // Récupérer l'équipe
    const team = roomState.teams.get(teamColor);
    if (team) {
      // Envoyer à tous les membres de la même équipe dans la salle
      for (const member of team.players) {
        io.to(member.socketId).emit('chat:message', msg);
      }
    }

    logger.info('Message chat d\'équipe transféré', {
      roomCode,
      teamColor,
      sender: player.pseudo,
      messageLength: text.length,
    });
  });
}
