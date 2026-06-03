import type { Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@shared/socket.types';
type BattleMindSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
/**
 * Enregistre le handler heartbeat pour un socket donné.
 *
 * - Le client envoie 'ping' toutes les HEARTBEAT_INTERVAL ms.
 * - Si le serveur ne reçoit pas de ping après HEARTBEAT_TIMEOUT,
 *   le joueur est considéré déconnecté et le socket est coupé.
 */
export declare function registerHeartbeat(socket: BattleMindSocket): void;
export {};
//# sourceMappingURL=heartbeatHandlers.d.ts.map