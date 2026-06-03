import type { TournamentBracket, Match, TeamColor } from '@shared/game.types';
/**
 * Génère le bracket de tournoi fixe pour le MVP.
 *
 * Demi-finale 1 : Bleu vs Rouge
 * Demi-finale 2 : Jaune vs Blanc
 * Finale        : Vainqueur SF1 vs Vainqueur SF2
 *
 * Alias vers generateBracket() pour une utilisation directe.
 */
export declare function createTournamentBracket(): TournamentBracket;
/**
 * Crée un objet Match avec un ID unique.
 */
export declare function createMatch(teamA: TeamColor, teamB: TeamColor, phase: 'semi-final' | 'final'): Match;
/**
 * Retourne le prochain match à jouer depuis le bracket.
 * Cherche d'abord un match en cours, puis le premier en attente.
 */
export declare function getNextMatch(bracket: TournamentBracket): Match | null;
/**
 * Vérifie si le tournoi est entièrement terminé.
 */
export declare function isTournamentFinished(bracket: TournamentBracket): boolean;
//# sourceMappingURL=TournamentEngine.d.ts.map