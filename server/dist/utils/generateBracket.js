"use strict";
// ============================================================
// BattleMind Server — Utilitaire : génération de l'arbre tournoi
// Bracket fixe MVP : 4 équipes, 3 matchs
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBracket = generateBracket;
const uuid_1 = require("uuid");
/**
 * Génère le bracket de tournoi fixe pour le MVP.
 *
 * Demi-finale 1 : Bleu vs Rouge
 * Demi-finale 2 : Jaune vs Blanc
 * Finale        : Vainqueur SF1 vs Vainqueur SF2
 */
function generateBracket() {
    return {
        semiFinal1: {
            id: (0, uuid_1.v4)(),
            teamA: 'blue',
            teamB: 'red',
            phase: 'semi-final',
            currentMode: null,
            activeTeam: null,
            status: 'pending',
            winnerId: null,
        },
        semiFinal2: {
            id: (0, uuid_1.v4)(),
            teamA: 'yellow',
            teamB: 'white',
            phase: 'semi-final',
            currentMode: null,
            activeTeam: null,
            status: 'pending',
            winnerId: null,
        },
        final: null,
    };
}
//# sourceMappingURL=generateBracket.js.map