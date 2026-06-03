// ============================================================
// BattleMind Server — Repository des questions SQLite
// ============================================================

import type Database from 'better-sqlite3';
import { getDatabase } from '../database/db';
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
export function getRandomByCategory(
  category: QuestionCategory,
): QuestionInternal | null {
  const db: Database.Database = getDatabase();
  const row = db
    .prepare(
      `SELECT * FROM questions
       WHERE category = ?
       ORDER BY RANDOM()
       LIMIT 1`,
    )
    .get(category) as QuestionInternal | undefined;

  return row ?? null;
}

/**
 * Récupère N questions aléatoires d'une catégorie donnée.
 */
export function getManyByCategory(
  category: QuestionCategory,
  limit: number = 5,
): QuestionInternal[] {
  const db: Database.Database = getDatabase();
  return db
    .prepare(
      `SELECT * FROM questions
       WHERE category = ?
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(category, limit) as QuestionInternal[];
}

/**
 * Récupère une question par son ID (pour valider la réponse côté serveur).
 */
export function getById(id: string): QuestionInternal | null {
  const db: Database.Database = getDatabase();
  const row = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(id) as QuestionInternal | undefined;

  return row ?? null;
}

/**
 * Compte le total de questions disponibles par catégorie.
 */
export function countByCategory(): Record<string, number> {
  const db: Database.Database = getDatabase();
  const rows = db
    .prepare(
      `SELECT category, COUNT(*) as count
       FROM questions
       GROUP BY category`,
    )
    .all() as { category: string; count: number }[];

  return Object.fromEntries(rows.map(r => [r.category, r.count]));
}
