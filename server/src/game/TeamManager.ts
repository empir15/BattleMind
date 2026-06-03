// ============================================================
// BattleMind Server — TeamManager
// Fonctions utilitaires dédiées à la gestion des équipes :
// jokers, capitaines et réinitialisation des vies entre matchs.
// ============================================================

import type { Team, TeamColor } from '@shared/game.types';
import { GAME_CONSTANTS } from '@shared/constants';
import { logger } from '../logger/logger';

/**
 * Réinitialise les vies et jokers de toutes les équipes.
 * Appelé au démarrage de chaque nouveau match.
 */
export function resetTeamsForMatch(teams: Map<TeamColor, Team>): void {
  for (const team of teams.values()) {
    team.lives = GAME_CONSTANTS.MAX_LIVES;
    team.jokerTime = true;
    team.jokerHint = true;
    team.score = 0;
  }
  logger.info('Équipes réinitialisées pour le nouveau match');
}

/**
 * Désigne le capitaine d'une équipe (premier joueur inscrit).
 * Si le capitaine actuel quitte, le suivant prend le relais.
 */
export function recalculateCaptain(team: Team): void {
  // Retire tous les titres de capitaine
  for (const player of team.players) {
    player.isCaptain = false;
  }
  // Premier joueur restant devient capitaine
  if (team.players.length > 0) {
    team.players[0].isCaptain = true;
    logger.info('Nouveau capitaine désigné', {
      team: team.color,
      captain: team.players[0].pseudo,
    });
  }
}

/**
 * Vérifie si le joker temps est disponible pour une équipe.
 */
export function canUseTimeJoker(team: Team): boolean {
  return team.jokerTime;
}

/**
 * Vérifie si le joker indice est disponible et si la question a un indice.
 */
export function canUseHintJoker(team: Team, hasHint: boolean): boolean {
  return team.jokerHint && hasHint;
}

/**
 * Consomme le joker temps d'une équipe.
 */
export function consumeTimeJoker(team: Team): void {
  team.jokerTime = false;
  logger.info('Joker Temps consommé', { team: team.color });
}

/**
 * Consomme le joker indice d'une équipe.
 */
export function consumeHintJoker(team: Team): void {
  team.jokerHint = false;
  logger.info('Joker Indice consommé', { team: team.color });
}

/**
 * Retourne un résumé des jokers disponibles par équipe.
 */
export function getJokerStatus(teams: Map<TeamColor, Team>): Record<TeamColor, { time: boolean; hint: boolean }> {
  const result: Partial<Record<TeamColor, { time: boolean; hint: boolean }>> = {};
  for (const [color, team] of teams.entries()) {
    result[color] = {
      time: team.jokerTime,
      hint: team.jokerHint,
    };
  }
  return result as Record<TeamColor, { time: boolean; hint: boolean }>;
}
