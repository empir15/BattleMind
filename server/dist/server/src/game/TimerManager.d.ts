import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@shared/socket.types';
type BattleMindServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
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
export declare function startTimer(io: BattleMindServer, roomCode: string, duration: number, phase: string, onEnd: () => void): void;
/**
 * Ajoute du temps au timer en cours (Joker Temps).
 * @returns La nouvelle durée restante, ou null si pas de timer actif.
 */
export declare function addTime(roomCode: string, seconds: number): number | null;
/**
 * Annule le timer en cours pour une salle.
 */
export declare function stopTimer(roomCode: string): void;
/**
 * Vérifie si un timer est actif pour une salle.
 */
export declare function hasActiveTimer(roomCode: string): boolean;
export {};
//# sourceMappingURL=TimerManager.d.ts.map