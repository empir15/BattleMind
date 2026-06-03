"use strict";
// ============================================================
// BattleMind Server — RoomManager
// Gère toutes les salles actives en mémoire.
// Source de vérité unique de l'état du jeu côté serveur.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRoomByCode = getRoomByCode;
exports.getRoomBySocketId = getRoomBySocketId;
exports.deleteRoom = deleteRoom;
exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.getPlayers = getPlayers;
exports.assignTeam = assignTeam;
exports.getTeams = getTeams;
exports.validateTeamsForStart = validateTeamsForStart;
exports.startTournament = startTournament;
exports.loseLife = loseLife;
const constants_1 = require("@shared/constants");
const generateBracket_1 = require("../utils/generateBracket");
const logger_1 = require("../logger/logger");
// ─── Stockage en mémoire ─────────────────────────────────────
const rooms = new Map();
// ─── Création / Rejoindre ────────────────────────────────────
function createRoom(code, judgeSocketId, questionMode) {
    const room = {
        code,
        judgeSocketId,
        questionMode,
        status: 'waiting',
    };
    const teams = new Map();
    for (const color of constants_1.GAME_CONSTANTS.TEAMS) {
        teams.set(color, {
            color,
            players: [],
            lives: constants_1.GAME_CONSTANTS.MAX_LIVES,
            jokerTime: true,
            jokerHint: true,
            score: 0,
        });
    }
    const state = {
        room,
        players: new Map(),
        teams,
        bracket: null,
        currentMatchId: null,
    };
    rooms.set(code, state);
    logger_1.logger.info('Salle créée', { roomCode: code, judgeSocketId, questionMode });
    return state;
}
function getRoomByCode(code) {
    return rooms.get(code) ?? null;
}
function getRoomBySocketId(socketId) {
    for (const state of rooms.values()) {
        if (state.players.has(socketId))
            return state;
    }
    return null;
}
function deleteRoom(code) {
    rooms.delete(code);
    logger_1.logger.info('Salle supprimée', { roomCode: code });
}
// ─── Joueurs ─────────────────────────────────────────────────
function addPlayer(code, player) {
    const state = rooms.get(code);
    if (!state)
        return false;
    state.players.set(player.socketId, player);
    logger_1.logger.info('Joueur ajouté à la salle', {
        roomCode: code,
        pseudo: player.pseudo,
        role: player.role,
    });
    return true;
}
function removePlayer(socketId) {
    const state = getRoomBySocketId(socketId);
    if (!state)
        return null;
    const player = state.players.get(socketId);
    if (player) {
        // Retirer le joueur de son équipe
        if (player.teamColor) {
            const team = state.teams.get(player.teamColor);
            if (team) {
                team.players = team.players.filter(p => p.socketId !== socketId);
                // Recalculer le capitaine si nécessaire
                if (player.isCaptain && team.players.length > 0) {
                    team.players[0].isCaptain = true;
                }
            }
        }
        state.players.delete(socketId);
        logger_1.logger.warn('Joueur retiré de la salle', {
            roomCode: state.room.code,
            pseudo: player.pseudo,
        });
    }
    return state;
}
function getPlayers(code) {
    const state = rooms.get(code);
    if (!state)
        return [];
    return Array.from(state.players.values());
}
// ─── Équipes ─────────────────────────────────────────────────
/**
 * Assigne un joueur à une équipe.
 * Vérifie les contraintes (max joueurs, équipe pleine).
 */
function assignTeam(socketId, teamColor, roomCode) {
    const state = rooms.get(roomCode);
    if (!state)
        return { success: false, error: 'Salle introuvable.' };
    const player = state.players.get(socketId);
    if (!player)
        return { success: false, error: 'Joueur introuvable.' };
    const team = state.teams.get(teamColor);
    if (!team)
        return { success: false, error: 'Équipe introuvable.' };
    if (team.players.length >= constants_1.GAME_CONSTANTS.MAX_PLAYERS_PER_TEAM) {
        return { success: false, error: 'Cette équipe est pleine (max 5 joueurs).' };
    }
    // Retirer de l'ancienne équipe si nécessaire
    if (player.teamColor) {
        const oldTeam = state.teams.get(player.teamColor);
        if (oldTeam) {
            oldTeam.players = oldTeam.players.filter(p => p.socketId !== socketId);
        }
    }
    // Assigner à la nouvelle équipe
    player.teamColor = teamColor;
    // Premier joueur dans l'équipe = capitaine
    player.isCaptain = team.players.length === 0;
    team.players.push(player);
    return { success: true };
}
function getTeams(code) {
    const state = rooms.get(code);
    if (!state)
        return [];
    return Array.from(state.teams.values());
}
// ─── Tournoi ─────────────────────────────────────────────────
/**
 * Vérifie que toutes les équipes respectent les contraintes
 * avant de démarrer le tournoi.
 */
function validateTeamsForStart(code) {
    const state = rooms.get(code);
    if (!state)
        return { valid: false, error: 'Salle introuvable.' };
    for (const [color, team] of state.teams) {
        if (team.players.length < constants_1.GAME_CONSTANTS.MIN_PLAYERS_PER_TEAM) {
            return {
                valid: false,
                error: `L'équipe ${color} n'a pas assez de joueurs (min ${constants_1.GAME_CONSTANTS.MIN_PLAYERS_PER_TEAM}).`,
            };
        }
    }
    return { valid: true };
}
function startTournament(code) {
    const state = rooms.get(code);
    if (!state)
        return null;
    state.bracket = (0, generateBracket_1.generateBracket)();
    state.room.status = 'in-match';
    logger_1.logger.info('Tournoi démarré', { roomCode: code });
    return state.bracket;
}
// ─── Vies ────────────────────────────────────────────────────
function loseLife(code, teamColor) {
    const state = rooms.get(code);
    if (!state)
        return { lives: 0, eliminated: true };
    const team = state.teams.get(teamColor);
    if (!team)
        return { lives: 0, eliminated: true };
    team.lives = Math.max(0, team.lives - 1);
    const eliminated = team.lives === 0;
    logger_1.logger.info('Équipe perd une vie', {
        roomCode: code,
        team: teamColor,
        livesRemaining: team.lives,
        eliminated,
    });
    return { lives: team.lives, eliminated };
}
//# sourceMappingURL=RoomManager.js.map