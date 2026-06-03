// ============================================================
// BattleMind Server — Point d'entrée principal
// Démarre le serveur HTTP Express et le serveur Socket.IO.
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './logger/logger';
import { initDatabase } from './database/db';
import { registerAllHandlers } from './sockets';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.socket.cors.origin,
    methods: config.socket.cors.methods as unknown as string[],
  },
  pingTimeout: config.socket.pingTimeout,
  pingInterval: config.socket.pingInterval,
});

// Initialise la base de données SQLite et applique le seed questions
initDatabase();

// Enregistre tous les sockets et leurs modules de handlers
registerAllHandlers(io);

// Lancement de l'écoute réseau sur le port LAN configuré
httpServer.listen(config.server.port, config.server.host, () => {
  logger.info(`✅ BattleMind Server running successfully`, {
    host: config.server.host,
    port: config.server.port,
  });
});
