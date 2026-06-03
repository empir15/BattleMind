"use strict";
// ============================================================
// BattleMind Server — Point d'entrée principal
// Démarre le serveur HTTP Express et le serveur Socket.IO.
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const logger_1 = require("./logger/logger");
const db_1 = require("./database/db");
const sockets_1 = require("./sockets");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: config_1.config.socket.cors,
    pingTimeout: config_1.config.socket.pingTimeout,
    pingInterval: config_1.config.socket.pingInterval,
});
// Initialise la base de données SQLite et applique le seed questions
(0, db_1.initDatabase)();
// Enregistre tous les sockets et leurs modules de handlers
(0, sockets_1.registerAllHandlers)(io);
// Lancement de l'écoute réseau sur le port LAN configuré
httpServer.listen(config_1.config.server.port, config_1.config.server.host, () => {
    logger_1.logger.info(`✅ BattleMind Server running successfully`, {
        host: config_1.config.server.host,
        port: config_1.config.server.port,
    });
});
//# sourceMappingURL=server.js.map