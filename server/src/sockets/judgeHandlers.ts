// ============================================================
// BattleMind Server — Judge Handlers
// Actions réservées uniquement au Juge.
// Note : judge:validateQuestion et judge:validateAnswer sont
// gérés dans matchHandlers.ts pour rester co-localisés.
// Ce fichier gère les actions de contrôle de partie (pause, reset...).
// ============================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import { getRoomByCode } from '../game/RoomManager';
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

export function registerJudgeHandlers(
  socket: BattleMindSocket,
  io: BattleMindServer,
): void {
  // Toutes les actions de validation du juge (questions, réponses)
  // sont déclarées dans matchHandlers.ts pour cohérence architecturale.
  // Ce module est un point d'extension pour de futures actions juge :
  //   - Pause de partie
  //   - Kick d'un joueur
  //   - Reset du timer manuel
  //   - Mode spectateur
}
