// ============================================================
// BattleMind — Constantes partagées
// Importées via @shared/constants côté server ET mobile.
// ============================================================

export const GAME_CONSTANTS = {
  // ─── Équipes ──────────────────────────────────────────────
  TEAMS: ['blue', 'red', 'yellow', 'white'] as const,
  MIN_PLAYERS_PER_TEAM: 2,
  MAX_PLAYERS_PER_TEAM: 5,

  // ─── Vies ─────────────────────────────────────────────────
  MAX_LIVES: 2,

  // ─── Timers (en secondes) ─────────────────────────────────
  /** Temps de réponse en mode Discussion */
  DISCUSSION_TIMER: 10,
  /** Temps total pour fournir les réponses en mode Enchère */
  AUCTION_TIMER: 30,
  /** Temps par tour d'enchère */
  BID_TIMER: 5,

  // ─── Jokers ───────────────────────────────────────────────
  /** Secondes ajoutées par le Joker Temps */
  JOKER_TIME_BONUS: 10,

  // ─── Mode Discussion ──────────────────────────────────────
  /** Nombre de tentatives maximum en mode Discussion */
  MAX_ATTEMPTS: 2,

  // ─── Heartbeat (en millisecondes) ─────────────────────────
  /** Intervalle auquel le client envoie un ping */
  HEARTBEAT_INTERVAL: 5000,
  /** Délai max avant de considérer un joueur déconnecté */
  HEARTBEAT_TIMEOUT: 15000,

  // ─── Salle ────────────────────────────────────────────────
  /** Longueur du code de salle généré */
  ROOM_CODE_LENGTH: 6,
} as const;

// Type utilitaire pour les valeurs de TEAMS
export type TeamsConstant = typeof GAME_CONSTANTS.TEAMS[number];
