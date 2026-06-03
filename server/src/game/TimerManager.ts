// ============================================================
// BattleMind Server — Timer Manager
// Chronomètres officiels côté serveur uniquement.
// ============================================================

import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';

type BattleMindServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

interface ActiveTimer {
  interval: NodeJS.Timeout;
  remaining: number;
  onEnd: () => void;
}

// Timers actifs par salle
const timers = new Map<string, ActiveTimer>();

/**
 * Démarre un chronomètre pour une salle.
 * Émet 'match:timerUpdate' chaque seconde et 'match:timerEnd' à 0.
 *
 * @param io        - Serveur Socket.IO
 * @param roomCode  - Code de la salle
 * @param duration  - Durée en secondes
 * @param phase     - Label de la phase (ex: 'discussion', 'auction', 'bid')
 * @param onEnd     - Callback exécuté quand le timer atteint 0
 */
export function startTimer(
  io: BattleMindServer,
  roomCode: string,
  duration: number,
  phase: string,
  onEnd: () => void,
): void {
  // Annule un timer existant si présent
  stopTimer(roomCode);

  let remaining = duration;

  // Notifie le démarrage
  io.to(roomCode).emit('match:timerStart', duration, phase);

  const interval = setInterval(() => {
    remaining--;
    io.to(roomCode).emit('match:timerUpdate', remaining);

    if (remaining <= 0) {
      clearInterval(interval);
      timers.delete(roomCode);
      io.to(roomCode).emit('match:timerEnd');
      onEnd();
    }
  }, 1000);

  timers.set(roomCode, { interval, remaining, onEnd });
}

/**
 * Ajoute du temps au timer en cours (Joker Temps).
 * @returns La nouvelle durée restante, ou null si pas de timer actif.
 */
export function addTime(roomCode: string, seconds: number): number | null {
  const timer = timers.get(roomCode);
  if (!timer) return null;

  timer.remaining += seconds;
  return timer.remaining;
}

/**
 * Annule le timer en cours pour une salle.
 */
export function stopTimer(roomCode: string): void {
  const timer = timers.get(roomCode);
  if (timer) {
    clearInterval(timer.interval);
    timers.delete(roomCode);
  }
}

/**
 * Vérifie si un timer est actif pour une salle.
 */
export function hasActiveTimer(roomCode: string): boolean {
  return timers.has(roomCode);
}
