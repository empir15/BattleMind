// ============================================================
// BattleMind Server — Utilitaire : génération code de salle
// ============================================================

import { GAME_CONSTANTS } from '@shared/constants';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 (confusion visuelle)

/**
 * Génère un code de salle aléatoire (ex: "A3KZ7B").
 * Utilise uniquement des caractères non ambigus.
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}
