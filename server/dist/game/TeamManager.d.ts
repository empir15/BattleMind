import type { Team, TeamColor } from '@shared/game.types';
/**
 * Réinitialise les vies et jokers de toutes les équipes.
 * Appelé au démarrage de chaque nouveau match.
 */
export declare function resetTeamsForMatch(teams: Map<TeamColor, Team>): void;
/**
 * Désigne le capitaine d'une équipe (premier joueur inscrit).
 * Si le capitaine actuel quitte, le suivant prend le relais.
 */
export declare function recalculateCaptain(team: Team): void;
/**
 * Vérifie si le joker temps est disponible pour une équipe.
 */
export declare function canUseTimeJoker(team: Team): boolean;
/**
 * Vérifie si le joker indice est disponible et si la question a un indice.
 */
export declare function canUseHintJoker(team: Team, hasHint: boolean): boolean;
/**
 * Consomme le joker temps d'une équipe.
 */
export declare function consumeTimeJoker(team: Team): void;
/**
 * Consomme le joker indice d'une équipe.
 */
export declare function consumeHintJoker(team: Team): void;
/**
 * Retourne un résumé des jokers disponibles par équipe.
 */
export declare function getJokerStatus(teams: Map<TeamColor, Team>): Record<TeamColor, {
    time: boolean;
    hint: boolean;
}>;
//# sourceMappingURL=TeamManager.d.ts.map