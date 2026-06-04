// ============================================================
// BattleMind Mobile — Client Socket.IO
// Gère la connexion, déconnexion et le heartbeat (ping/pong).
// ============================================================

import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/socket.types';
import { serverConfig } from '../config/serverConfig';
import { GAME_CONSTANTS } from '@shared/constants';

// Instance globale du socket
export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialise et connecte la socket au serveur Node.js via l'IP enregistrée.
 */
export function connectSocket(
  onConnect?: () => void,
  onError?: (err: Error) => void,
): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  // Si déjà connecté, on réutilise l'existant
  if (socket && socket.connected) {
    onConnect?.();
    return socket;
  }

  const serverUrl = serverConfig.getServerUrl();
  if (!serverUrl) {
    onError?.(new Error('Veuillez configurer l\'IP du serveur dans les réglages.'));
    return null;
  }

  const isOnline = serverConfig.getConnectionMode() === 'online';
  console.log(`[Socket] Tentative de connexion sur : ${serverUrl} (mode: ${isOnline ? 'online' : 'LAN'})`);

  // En mode Online : polling d'abord pour la négociation, puis upgrade WebSocket automatique
  // En mode LAN   : WebSocket direct pour latence minimale
  socket = io(serverUrl, {
    transports: isOnline ? ['polling', 'websocket'] : ['websocket'],
    autoConnect: false,
    forceNew: true,
    timeout: isOnline ? 10000 : 5000,
  });

  // ── Événements de connexion ─────────────────────────────────
  socket.on('connect', () => {
    console.log('[Socket] Connecté au serveur de jeu avec succès.');

    // Démarrage automatique du heartbeat ping (Amélioration 3)
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('ping');
      }
    }, GAME_CONSTANTS.HEARTBEAT_INTERVAL);

    onConnect?.();
  });

  socket.on('pong', () => {
    // Heartbeat pong reçu du serveur (confirmation réseau actif)
  });

  socket.on('connect_error', (error: Error) => {
    console.error('[Socket] Erreur de connexion au serveur LAN', error);
    onError?.(error);
  });

  socket.on('disconnect', (reason: string) => {
    console.warn('[Socket] Socket déconnectée du serveur. Raison :', reason);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  socket.connect();
  return socket;
}

/**
 * Coupe la socket proprement (lors d'un retour à l'accueil par exemple).
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  console.log('[Socket] Déconnexion propre effectuée.');
}
