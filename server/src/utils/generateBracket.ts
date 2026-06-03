// ============================================================
// BattleMind Server — Utilitaire : génération de l'arbre tournoi
// Bracket fixe MVP : 4 équipes, 3 matchs
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { TournamentBracket, TeamColor } from '@shared/game.types';

/**
 * Génère le bracket de tournoi fixe pour le MVP.
 *
 * Demi-finale 1 : Bleu vs Rouge
 * Demi-finale 2 : Jaune vs Blanc
 * Finale        : Vainqueur SF1 vs Vainqueur SF2
 */
export function generateBracket(): TournamentBracket {
  return {
    semiFinal1: {
      id: uuidv4(),
      teamA: 'blue' as TeamColor,
      teamB: 'red' as TeamColor,
      phase: 'semi-final',
      currentMode: null,
      activeTeam: null,
      status: 'pending',
      winnerId: null,
    },
    semiFinal2: {
      id: uuidv4(),
      teamA: 'yellow' as TeamColor,
      teamB: 'white' as TeamColor,
      phase: 'semi-final',
      currentMode: null,
      activeTeam: null,
      status: 'pending',
      winnerId: null,
    },
    final: null,
  };
}
