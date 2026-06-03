"use strict";
// ============================================================
// BattleMind Server — Logger (winston)
// Logs console + fichiers combined.log et error.log
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const { combine, timestamp, printf, colorize } = winston_1.default.format;
// Format personnalisé : [2024-01-01 12:00:00] INFO: message { meta }
const customFormat = printf(({ timestamp: ts, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
    return `[${ts}] ${level.toUpperCase()}: ${message}${metaStr}`;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logs.level,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    transports: [
        // Console avec couleurs
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), customFormat),
        }),
        // Tous les logs
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.config.logs.dir, 'combined.log'),
        }),
        // Erreurs uniquement
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.config.logs.dir, 'error.log'),
            level: 'error',
        }),
    ],
});
//# sourceMappingURL=logger.js.map