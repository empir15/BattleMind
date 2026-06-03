// ============================================================
// BattleMind Server — Enregistrement des Handlers Sockets
// Point d'entrée de toute l'activité temps réel.
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import { registerRoomHandlers } from './roomHandlers';
import { registerLobbyHandlers } from './lobbyHandlers';
import { registerMatchHandlers } from './matchHandlers';
import { registerJudgeHandlers } from './judgeHandlers';
import { registerJokerHandlers } from './jokerHandlers';
import { registerChatHandlers } from './chatHandlers';

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

/**
 * Enregistre tous les modules de handlers Socket.IO pour chaque client connecté.
 */
export function registerAllHandlers(io: BattleMindServer): void {
  io.on('connection', (socket: BattleMindSocket) => {
    // Les handlers s'enregistrent pour ce socket spécifique
    registerRoomHandlers(socket, io);
    registerLobbyHandlers(socket, io);
    registerMatchHandlers(socket, io);
    registerJudgeHandlers(socket, io);
    registerJokerHandlers(socket, io);
    registerChatHandlers(socket, io);
  });
}
