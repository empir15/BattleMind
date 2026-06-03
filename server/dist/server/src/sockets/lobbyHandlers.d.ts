import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@shared/socket.types';
type BattleMindSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type BattleMindServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export declare function registerLobbyHandlers(socket: BattleMindSocket, io: BattleMindServer): void;
export {};
//# sourceMappingURL=lobbyHandlers.d.ts.map