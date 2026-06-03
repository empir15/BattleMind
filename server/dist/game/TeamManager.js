"use strict";
// ============================================================
// BattleMind Server — TeamManager
// Fonctions utilitaires dédiées à la gestion des équipes :
// jokers, capitaines et réinitialisation des vies entre matchs.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTeamsForMatch = resetTeamsForMatch;
exports.recalculateCaptain = recalculateCaptain;
exports.canUseTimeJoker = canUseTimeJoker;
exports.canUseHintJoker = canUseHintJoker;
exports.consumeTimeJoker = consumeTimeJoker;
exports.consumeHintJoker = consumeHintJoker;
exports.getJokerStatus = getJokerStatus;
const constants_1 = require("@shared/constants");
const logger_1 = require("../logger/logger");
/**
 * Réinitialise les vies et jokers de toutes les équipes.
 * Appelé au démarrage de chaque nouveau match.
 */
function resetTeamsForMatch(teams) {
    for (const team of teams.values()) {
        team.lives = constants_1.GAME_CONSTANTS.MAX_LIVES;
        team.jokerTime = true;
        team.jokerHint = true;
        team.score = 0;
    }
    logger_1.logger.info('Équipes réinitialisées pour le nouveau match');
}
/**
 * Désigne le capitaine d'une équipe (premier joueur inscrit).
 * Si le capitaine actuel quitte, le suivant prend le relais.
 */
function recalculateCaptain(team) {
    // Retire tous les titres de capitaine
    for (const player of team.players) {
        player.isCaptain = false;
    }
    // Premier joueur restant devient capitaine
    if (team.players.length > 0) {
        team.players[0].isCaptain = true;
        logger_1.logger.info('Nouveau capitaine désigné', {
            team: team.color,
            captain: team.players[0].pseudo,
        });
    }
}
/**
 * Vérifie si le joker temps est disponible pour une équipe.
 */
function canUseTimeJoker(team) {
    return team.jokerTime;
}
/**
 * Vérifie si le joker indice est disponible et si la question a un indice.
 */
function canUseHintJoker(team, hasHint) {
    return team.jokerHint && hasHint;
}
/**
 * Consomme le joker temps d'une équipe.
 */
function consumeTimeJoker(team) {
    team.jokerTime = false;
    logger_1.logger.info('Joker Temps consommé', { team: team.color });
}
/**
 * Consomme le joker indice d'une équipe.
 */
function consumeHintJoker(team) {
    team.jokerHint = false;
    logger_1.logger.info('Joker Indice consommé', { team: team.color });
}
/**
 * Retourne un résumé des jokers disponibles par équipe.
 */
function getJokerStatus(teams) {
    const result = {};
    for (const [color, team] of teams.entries()) {
        result[color] = {
            time: team.jokerTime,
            hint: team.jokerHint,
        };
    }
    return result;
}
//# sourceMappingURL=TeamManager.js.map