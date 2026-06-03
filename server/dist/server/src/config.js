"use strict";
// ============================================================
// BattleMind Server — Configuration centralisée
// Pour changer de LAN → Internet : modifier getServerUrl()
// dans mobile/src/config/serverConfig.ts uniquement.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    server: {
        port: Number(process.env.PORT) || 3000,
        host: process.env.HOST || '0.0.0.0',
    },
    socket: {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        pingTimeout: 15000,
        pingInterval: 5000,
    },
    db: {
        path: './data/battlemind.db',
    },
    logs: {
        dir: './logs',
        level: process.env.LOG_LEVEL || 'info',
    },
};
//# sourceMappingURL=config.js.map