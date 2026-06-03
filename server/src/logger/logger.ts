// ============================================================
// BattleMind Server — Logger (winston)
// Logs console + fichiers combined.log et error.log
// ============================================================

import winston from 'winston';
import path from 'path';
import { config } from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

// Format personnalisé : [2024-01-01 12:00:00] INFO: message { meta }
const customFormat = printf(({ timestamp: ts, level, message, ...meta }: any) => {
  const metaStr =
    Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
  return `[${ts}] ${level.toUpperCase()}: ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: config.logs.level,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
  transports: [
    // Console avec couleurs
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        customFormat,
      ),
    }),
    // Tous les logs
    new winston.transports.File({
      filename: path.join(config.logs.dir, 'combined.log'),
    }),
    // Erreurs uniquement
    new winston.transports.File({
      filename: path.join(config.logs.dir, 'error.log'),
      level: 'error',
    }),
  ],
});
