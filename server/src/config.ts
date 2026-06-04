// ============================================================
// BattleMind Server — Configuration centralisée
// Pour changer de LAN → Internet : modifier getServerUrl()
// dans mobile/src/config/serverConfig.ts uniquement.
// ============================================================

export const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  socket: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 15000,
    pingInterval: 5000,
  },
  db: {
    // Sur Render : pointer vers /var/data/battlemind.db (disque persistant)
    // En local   : ./data/battlemind.db par défaut
    path: process.env.DATABASE_PATH || './data/battlemind.db',
  },
  logs: {
    dir: './logs',
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

