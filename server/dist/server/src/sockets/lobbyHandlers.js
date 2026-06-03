"use strict";
// ============================================================
// BattleMind Server — Lobby Handlers
// Gère : lobby:chooseTeam et lobby:ready (démarrage tournoi)
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLobbyHandlers = registerLobbyHandlers;
const RoomManager_1 = require("../game/RoomManager");
const logger_1 = require("../logger/logger");
function registerLobbyHandlers(socket, io) {
    // ── lobby:chooseTeam ──────────────────────────────────────
    socket.on('lobby:chooseTeam', (teamColor) => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        // Le juge ne peut pas rejoindre une équipe
        if (socket.data?.role === 'judge') {
            socket.emit('lobby:error', 'Le juge ne peut pas rejoindre une équipe.');
            return;
        }
        const result = (0, RoomManager_1.assignTeam)(socket.id, teamColor, roomCode);
        if (!result.success) {
            socket.emit(result.error === 'Cette équipe est pleine (max 5 joueurs).'
                ? 'lobby:teamFull'
                : 'lobby:error', teamColor);
            return;
        }
        // Diffuse le lobby mis à jour à tous
        io.to(roomCode).emit('lobby:updated', (0, RoomManager_1.getPlayers)(roomCode), (0, RoomManager_1.getTeams)(roomCode));
        logger_1.logger.info('Joueur a choisi une équipe', {
            roomCode,
            pseudo: socket.data?.pseudo,
            team: teamColor,
        });
    });
    // ── lobby:ready (Juge démarre le tournoi) ─────────────────
    socket.on('lobby:ready', () => {
        const roomCode = socket.data?.roomCode;
        if (!roomCode)
            return;
        // Seul le juge peut démarrer
        if (socket.data?.role !== 'judge') {
            socket.emit('lobby:error', 'Seul le juge peut démarrer la partie.');
            return;
        }
        const state = (0, RoomManager_1.getRoomByCode)(roomCode);
        if (!state)
            return;
        // Vérifie les contraintes d'équipe
        const validation = (0, RoomManager_1.validateTeamsForStart)(roomCode);
        if (!validation.valid) {
            socket.emit('lobby:error', validation.error);
            return;
        }
        // Génère le bracket et démarre le tournoi
        const bracket = (0, RoomManager_1.startTournament)(roomCode);
        if (!bracket)
            return;
        io.to(roomCode).emit('tournament:started', bracket);
        // Lance immédiatement le premier match (SF1 : Bleu vs Rouge)
        io.to(roomCode).emit('tournament:matchReady', bracket.semiFinal1);
        // Choisit aléatoirement l'équipe qui commence
        const startingTeam = Math.random() < 0.5
            ? bracket.semiFinal1.teamA
            : bracket.semiFinal1.teamB;
        io.to(roomCode).emit('match:modeRequest', startingTeam);
        logger_1.logger.info('Tournoi démarré par le juge', {
            roomCode,
            firstMatch: `${bracket.semiFinal1.teamA} vs ${bracket.semiFinal1.teamB}`,
            startingTeam,
        });
    });
}
//# sourceMappingURL=lobbyHandlers.js.map