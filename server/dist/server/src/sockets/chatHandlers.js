"use strict";
// ============================================================
// BattleMind Server — Chat Handlers
// Gère le chat privé par équipe.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatHandlers = registerChatHandlers;
const RoomManager_1 = require("../game/RoomManager");
const logger_1 = require("../logger/logger");
const uuid_1 = require("uuid");
function registerChatHandlers(socket, io) {
    // ── chat:send (Message d'équipe) ──────────────────────────
    socket.on('chat:send', (text) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        const roomState = (0, RoomManager_1.getRoomByCode)(roomCode);
        if (!roomState)
            return;
        const player = roomState.players.get(socket.id);
        if (!player || !player.teamColor) {
            logger_1.logger.warn('Joueur hors équipe ou inconnu tente d\'envoyer un message chat', {
                socketId: socket.id,
                pseudo: socket.data?.pseudo,
            });
            return;
        }
        const teamColor = player.teamColor;
        const msg = {
            id: (0, uuid_1.v4)(),
            senderPseudo: player.pseudo,
            teamColor,
            text,
            timestamp: Date.now(),
        };
        // Récupérer l'équipe
        const team = roomState.teams.get(teamColor);
        if (team) {
            // Envoyer à tous les membres de la même équipe dans la salle
            for (const member of team.players) {
                io.to(member.socketId).emit('chat:message', msg);
            }
        }
        logger_1.logger.info('Message chat d\'équipe transféré', {
            roomCode,
            teamColor,
            sender: player.pseudo,
            messageLength: text.length,
        });
    });
}
//# sourceMappingURL=chatHandlers.js.map