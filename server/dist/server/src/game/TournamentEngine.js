"use strict";
// ============================================================
// BattleMind Server — TournamentEngine
// Génération du bracket et récupération des matchs par phase.
// La logique d'avancement est dans MatchEngine.ts (advanceTournament).
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTournamentBracket = createTournamentBracket;
exports.createMatch = createMatch;
exports.getNextMatch = getNextMatch;
exports.isTournamentFinished = isTournamentFinished;
const uuid_1 = require("uuid");
/**
 * Génère le bracket de tournoi fixe pour le MVP.
 *
 * Demi-finale 1 : Bleu vs Rouge
 * Demi-finale 2 : Jaune vs Blanc
 * Finale        : Vainqueur SF1 vs Vainqueur SF2
 *
 * Alias vers generateBracket() pour une utilisation directe.
 */
function createTournamentBracket() {
    return {
        semiFinal1: createMatch('blue', 'red', 'semi-final'),
        semiFinal2: createMatch('yellow', 'white', 'semi-final'),
        final: null,
    };
}
/**
 * Crée un objet Match avec un ID unique.
 */
function createMatch(teamA, teamB, phase) {
    return {
        id: (0, uuid_1.v4)(),
        teamA,
        teamB,
        phase,
        currentMode: null,
        activeTeam: null,
        status: 'pending',
        winnerId: null,
    };
}
/**
 * Retourne le prochain match à jouer depuis le bracket.
 * Cherche d'abord un match en cours, puis le premier en attente.
 */
function getNextMatch(bracket) {
    const matches = [
        bracket.semiFinal1,
        bracket.semiFinal2,
        ...(bracket.final ? [bracket.final] : []),
    ];
    const ongoing = matches.find((m) => m.status === 'ongoing');
    if (ongoing)
        return ongoing;
    const pending = matches.find((m) => m.status === 'pending');
    return pending ?? null;
}
/**
 * Vérifie si le tournoi est entièrement terminé.
 */
function isTournamentFinished(bracket) {
    return (bracket.semiFinal1.status === 'finished' &&
        bracket.semiFinal2.status === 'finished' &&
        bracket.final?.status === 'finished');
}
//# sourceMappingURL=TournamentEngine.js.map