import type { Role } from '@shared/game.types';
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
export declare function authenticatePlayer(pseudo: string, role: Role, existingPseudos: string[]): AuthResult | AuthError;
//# sourceMappingURL=playerAuth.d.ts.map