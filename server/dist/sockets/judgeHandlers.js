"use strict";
// ============================================================
// BattleMind Server — Judge Handlers
// Actions réservées uniquement au Juge.
// Note : judge:validateQuestion et judge:validateAnswer sont
// gérés dans matchHandlers.ts pour rester co-localisés.
// Ce fichier gère les actions de contrôle de partie (pause, reset...).
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerJudgeHandlers = registerJudgeHandlers;
function registerJudgeHandlers(socket, io) {
    // Toutes les actions de validation du juge (questions, réponses)
    // sont déclarées dans matchHandlers.ts pour cohérence architecturale.
    // Ce module est un point d'extension pour de futures actions juge :
    //   - Pause de partie
    //   - Kick d'un joueur
    //   - Reset du timer manuel
    //   - Mode spectateur
}
//# sourceMappingURL=judgeHandlers.js.map