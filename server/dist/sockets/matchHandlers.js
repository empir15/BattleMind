"use strict";
// ============================================================
// BattleMind Server — Match Handlers
// Relie les sockets clients aux fonctions du MatchEngine.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMatchHandlers = registerMatchHandlers;
const MatchEngine_1 = require("../game/MatchEngine");
const logger_1 = require("../logger/logger");
function registerMatchHandlers(socket, io) {
    // ── match:chooseMode ───────────────────────────────────────
    socket.on('match:chooseMode', (mode) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: match:chooseMode', { roomCode, mode, player: socket.data.pseudo });
        (0, MatchEngine_1.handleChooseMode)(io, roomCode, mode);
    });
    // ── match:submitQuestion ───────────────────────────────────
    socket.on('match:submitQuestion', (text, category) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: match:submitQuestion', { roomCode, category, player: socket.data.pseudo });
        (0, MatchEngine_1.handleSubmitQuestion)(io, roomCode, text, category);
    });
    // ── judge:validateQuestion ─────────────────────────────────
    socket.on('judge:validateQuestion', (approved) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        if (socket.data?.role !== 'judge') {
            logger_1.logger.warn('Non-judge tried to validate question', { roomCode, player: socket.data.pseudo });
            return;
        }
        logger_1.logger.info('Action socket received: judge:validateQuestion', { roomCode, approved });
        (0, MatchEngine_1.handleValidateQuestion)(io, roomCode, approved);
    });
    // ── match:submitAnswer ─────────────────────────────────────
    socket.on('match:submitAnswer', (answer) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: match:submitAnswer', { roomCode, player: socket.data.pseudo });
        (0, MatchEngine_1.handleSubmitAnswer)(io, roomCode, socket.id, answer);
    });
    // ── judge:validateAnswer ───────────────────────────────────
    socket.on('judge:validateAnswer', (approved) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        if (socket.data?.role !== 'judge') {
            logger_1.logger.warn('Non-judge tried to validate answer', { roomCode, player: socket.data.pseudo });
            return;
        }
        logger_1.logger.info('Action socket received: judge:validateAnswer', { roomCode, approved });
        (0, MatchEngine_1.handleValidateAnswer)(io, roomCode, approved);
    });
    // ── auction:bid ────────────────────────────────────────────
    socket.on('auction:bid', (amount) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        logger_1.logger.info('Action socket received: auction:bid', { roomCode, amount, player: socket.data.pseudo });
        if (amount <= 0) {
            (0, MatchEngine_1.handleAuctionPass)(io, roomCode, socket.id);
        }
        else {
            (0, MatchEngine_1.handleAuctionBid)(io, roomCode, socket.id, amount);
        }
    });
}
//# sourceMappingURL=matchHandlers.js.map