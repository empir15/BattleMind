// ============================================================
// BattleMind Server — Heartbeat Handler
// Détecte les déconnexions Wi-Fi silencieuses via ping/pong.
// ============================================================

import type { Socket, Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import { GAME_CONSTANTS } from '@shared/constants';
import { logger } from '../logger/logger';

type BattleMindSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Enregistre le handler heartbeat pour un socket donné.
 *
 * - Le client envoie 'ping' toutes les HEARTBEAT_INTERVAL ms.
 * - Si le serveur ne reçoit pas de ping après HEARTBEAT_TIMEOUT,
 *   le joueur est considéré déconnecté et le socket est coupé.
 */
export function registerHeartbeat(socket: BattleMindSocket): void {
  let missedPings = 0;
  const MAX_MISSED = 3;
  const checkInterval = GAME_CONSTANTS.HEARTBEAT_TIMEOUT / MAX_MISSED;

  const interval = setInterval(() => {
    missedPings++;
    if (missedPings >= MAX_MISSED) {
      logger.warn('Joueur déconnecté par timeout heartbeat', {
        socketId: socket.id,
        pseudo: socket.data.pseudo ?? 'unknown',
      });
      clearInterval(interval);
      socket.disconnect(true);
    }
  }, checkInterval);

  // Réinitialise le compteur à chaque ping reçu
  socket.on('ping', () => {
    missedPings = 0;
    socket.emit('pong');
  });

  // Nettoyage à la déconnexion normale
  socket.on('disconnect', () => {
    clearInterval(interval);
  });
}
