"use strict";
// ============================================================
// BattleMind Server — Room Handlers
// Gère : room:create et room:join
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomHandlers = registerRoomHandlers;
const playerAuth_1 = require("../auth/playerAuth");
const generateRoomCode_1 = require("../utils/generateRoomCode");
const RoomManager_1 = require("../game/RoomManager");
const heartbeatHandlers_1 = require("./heartbeatHandlers");
const logger_1 = require("../logger/logger");
function registerRoomHandlers(socket, io) {
    // ── room:create (Juge uniquement) ──────────────────────────
    socket.on('room:create', (pseudo, questionMode) => {
        const auth = (0, playerAuth_1.authenticatePlayer)(pseudo, 'judge', []);
        if (!auth.success) {
            socket.emit('auth:error', auth.error);
            return;
        }
        // Génère un code unique non utilisé
        let code = (0, generateRoomCode_1.generateRoomCode)();
        while ((0, RoomManager_1.getRoomByCode)(code)) {
            code = (0, generateRoomCode_1.generateRoomCode)();
        }
        // Crée la salle
        const state = (0, RoomManager_1.createRoom)(code, socket.id, questionMode);
        // Crée le joueur Juge
        const judge = {
            id: auth.playerId,
            pseudo,
            teamColor: null,
            isCaptain: false,
            role: 'judge',
            socketId: socket.id,
        };
        // Attache les données au socket
        socket.data = {
            playerId: auth.playerId,
            pseudo,
            role: 'judge',
            roomCode: code,
        };
        (0, RoomManager_1.addPlayer)(code, judge);
        socket.join(code);
        socket.emit('auth:success', judge);
        socket.emit('room:created', state.room);
        // Démarre la surveillance heartbeat
        (0, heartbeatHandlers_1.registerHeartbeat)(socket);
        logger_1.logger.info('Salle créée par le Juge', {
            roomCode: code,
            pseudo,
            questionMode,
        });
    });
    // ── room:join (Joueurs) ────────────────────────────────────
    socket.on('room:join', (code, pseudo) => {
        const state = (0, RoomManager_1.getRoomByCode)(code);
        if (!state) {
            socket.emit('room:error', 'Salle introuvable. Vérifiez le code.');
            return;
        }
        if (state.room.status !== 'waiting') {
            socket.emit('room:error', 'La partie est déjà en cours.');
            return;
        }
        // Vérifie les pseudos existants dans la salle
        const existingPseudos = (0, RoomManager_1.getPlayers)(code).map(p => p.pseudo);
        const auth = (0, playerAuth_1.authenticatePlayer)(pseudo, 'player', existingPseudos);
        if (!auth.success) {
            socket.emit('auth:error', auth.error);
            return;
        }
        const player = {
            id: auth.playerId,
            pseudo,
            teamColor: null,
            isCaptain: false,
            role: 'player',
            socketId: socket.id,
        };
        socket.data = {
            playerId: auth.playerId,
            pseudo,
            role: 'player',
            roomCode: code,
        };
        (0, RoomManager_1.addPlayer)(code, player);
        socket.join(code);
        socket.emit('auth:success', player);
        socket.emit('room:joined', state.room, player);
        // Informe tous les joueurs du lobby mis à jour
        io.to(code).emit('lobby:updated', (0, RoomManager_1.getPlayers)(code), (0, RoomManager_1.getTeams)(code));
        // Démarre la surveillance heartbeat
        (0, heartbeatHandlers_1.registerHeartbeat)(socket);
        logger_1.logger.info('Joueur a rejoint la salle', {
            roomCode: code,
            pseudo,
            socketId: socket.id,
        });
    });
    // ── Déconnexion ───────────────────────────────────────────
    socket.on('disconnect', () => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        const isJudge = socket.data?.role === 'judge';
        if (isJudge) {
            // Le juge quitte → fin de partie pour tous
            io.to(roomCode).emit('judge:disconnected');
            (0, RoomManager_1.deleteRoom)(roomCode);
            logger_1.logger.warn('Juge déconnecté — partie terminée et salle supprimée', {
                roomCode,
                pseudo: socket.data?.pseudo,
            });
        }
        else {
            // Un joueur quitte → notifier les autres et le retirer du manager
            (0, RoomManager_1.removePlayer)(socket.id);
            io.to(roomCode).emit('player:disconnected', socket.data.playerId);
            io.to(roomCode).emit('lobby:updated', (0, RoomManager_1.getPlayers)(roomCode), (0, RoomManager_1.getTeams)(roomCode));
            logger_1.logger.warn('Joueur déconnecté et retiré', {
                roomCode,
                pseudo: socket.data?.pseudo,
            });
        }
    });
}
//# sourceMappingURL=roomHandlers.js.map