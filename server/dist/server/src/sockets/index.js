"use strict";
// ============================================================
// BattleMind Server — Enregistrement des Handlers Sockets
// Point d'entrée de toute l'activité temps réel.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllHandlers = registerAllHandlers;
const roomHandlers_1 = require("./roomHandlers");
const lobbyHandlers_1 = require("./lobbyHandlers");
const matchHandlers_1 = require("./matchHandlers");
const judgeHandlers_1 = require("./judgeHandlers");
const jokerHandlers_1 = require("./jokerHandlers");
const chatHandlers_1 = require("./chatHandlers");
/**
 * Enregistre tous les modules de handlers Socket.IO pour chaque client connecté.
 */
function registerAllHandlers(io) {
    io.on('connection', (socket) => {
        // Les handlers s'enregistrent pour ce socket spécifique
        (0, roomHandlers_1.registerRoomHandlers)(socket, io);
        (0, lobbyHandlers_1.registerLobbyHandlers)(socket, io);
        (0, matchHandlers_1.registerMatchHandlers)(socket, io);
        (0, judgeHandlers_1.registerJudgeHandlers)(socket, io);
        (0, jokerHandlers_1.registerJokerHandlers)(socket, io);
        (0, chatHandlers_1.registerChatHandlers)(socket, io);
    });
}
//# sourceMappingURL=index.js.map