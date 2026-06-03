"use strict";
// ============================================================
// BattleMind Server — Joker Handlers
// Gère l'utilisation des jokers Temps et Indice.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJokerHandlers = registerJokerHandlers;
const MatchEngine_1 = require("../game/MatchEngine");
const logger_1 = require("../logger/logger");
function registerJokerHandlers(socket, io) {
    // ── joker:useTime ──────────────────────────────────────────
    socket.on('joker:useTime', () => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: joker:useTime', { roomCode, player: socket.data.pseudo });
        (0, MatchEngine_1.handleUseTimeJoker)(io, roomCode, socket.id);
    });
    // ── joker:useHint ──────────────────────────────────────────
    socket.on('joker:useHint', () => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: joker:useHint', { roomCode, player: socket.data.pseudo });
        (0, MatchEngine_1.handleUseHintJoker)(io, roomCode, socket.id);
    });
}
//# sourceMappingURL=jokerHandlers.js.map