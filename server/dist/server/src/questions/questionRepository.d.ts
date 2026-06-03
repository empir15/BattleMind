import type { QuestionCategory } from '@shared/game.types';
/** Type interne serveur : contient la réponse (jamais envoyée au client) */
export interface QuestionInternal {
    id: string;
    text: string;
    answer: string;
    hint: string | null;
    category: QuestionCategory;
    difficulty: number;
    mode: string;
}
/**
 * Récupère une question aléatoire par catégorie.
 */
export declare function getRandomByCategory(category: QuestionCategory): QuestionInternal | null;
/**
 * Récupère N questions aléatoires d'une catégorie donnée.
 */
export declare function getManyByCategory(category: QuestionCategory, limit?: number): QuestionInternal[];
/**
 * Récupère une question par son ID (pour valider la réponse côté serveur).
 */
export declare function getById(id: string): QuestionInternal | null;
/**
 * Compte le total de questions disponibles par catégorie.
 */
export declare function countByCategory(): Record<string, number>;
//# sourceMappingURL=questionRepository.d.ts.map