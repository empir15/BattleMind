import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@shared/socket.types';
type BattleMindServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
/**
 * Enregistre tous les modules de handlers Socket.IO pour chaque client connecté.
 */
export declare function registerAllHandlers(io: BattleMindServer): void;
export {};
//# sourceMappingURL=index.d.ts.map