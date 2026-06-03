// ============================================================
// BattleMind Server — Authentification légère des joueurs
// Génère un UUID unique et valide le pseudo à la connexion.
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Role } from '@shared/game.types';

// Pseudos réservés au système / rôle juge
const RESERVED_PSEUDOS = ['juge', 'judge', 'admin', 'system', 'server', 'battlemind'];

export interface AuthResult {
  success: true;
  playerId: string;
}

export interface AuthError {
  success: false;
  error: string;
}

/**
 * Valide un pseudo et génère un UUID unique pour le joueur.
 * Appelé côté serveur lors de room:create ou room:join.
 *
 * @param pseudo        - Le pseudo choisi par l'utilisateur
 * @param role          - Le rôle (judge | player)
 * @param existingPseudos - Liste des pseudos déjà utilisés dans la salle
 */
export function authenticatePlayer(
  pseudo: string,
  role: Role,
  existingPseudos: string[],
): AuthResult | AuthError {
  const trimmed = pseudo.trim();

  // Longueur
  if (trimmed.length < 2 || trimmed.length > 20) {
    return {
      success: false,
      error: 'Le pseudo doit contenir entre 2 et 20 caractères.',
    };
  }

  // Caractères autorisés : lettres, chiffres, underscore, tiret
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      success: false,
      error: 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -.',
    };
  }

  // Mots réservés (sauf si c'est le juge qui utilise "juge")
  const lowerPseudo = trimmed.toLowerCase();
  if (
    role !== 'judge' &&
    RESERVED_PSEUDOS.includes(lowerPseudo)
  ) {
    return { success: false, error: 'Ce pseudo est réservé.' };
  }

  // Doublon dans la salle
  const lowerExisting = existingPseudos.map(p => p.toLowerCase());
  if (lowerExisting.includes(lowerPseudo)) {
    return {
      success: false,
      error: 'Ce pseudo est déjà utilisé dans cette salle.',
    };
  }

  return { success: true, playerId: uuidv4() };
}
