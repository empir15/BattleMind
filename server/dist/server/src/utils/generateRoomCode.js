"use strict";
// ============================================================
// BattleMind Server — Utilitaire : génération code de salle
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
const constants_1 = require("@shared/constants");
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 (confusion visuelle)
/**
 * Génère un code de salle aléatoire (ex: "A3KZ7B").
 * Utilise uniquement des caractères non ambigus.
 */
function generateRoomCode() {
    let code = '';
    for (let i = 0; i < constants_1.GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
        code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    return code;
}
//# sourceMappingURL=generateRoomCode.js.map