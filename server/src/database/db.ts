// ============================================================
// BattleMind Server — Base de données SQLite
// Initialisation et connexion via better-sqlite3
// ============================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { logger } from '../logger/logger';
import { seedQuestions } from './seeds';

let db: Database.Database;

/**
 * Initialise la connexion SQLite et crée les tables si nécessaire.
 * Doit être appelé une seule fois au démarrage du serveur.
 */
export function initDatabase(): Database.Database {
  const dbPath = path.resolve(config.db.path);
  const dbDir = path.dirname(dbPath);

  // Crée le dossier data/ si inexistant
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Active le mode WAL pour de meilleures performances
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  seedQuestions(db);
  logger.info('Base de données SQLite initialisée', { path: dbPath });

  return db;
}

/**
 * Retourne l'instance de la base de données.
 * initDatabase() doit avoir été appelé avant.
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// ─── Migrations ──────────────────────────────────────────────

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      answer      TEXT NOT NULL,
      hint        TEXT,
      category    TEXT NOT NULL CHECK(category IN (
                    'geography','history','sciences','sport',
                    'music','cinema','computing','africa',
                    'cameroon','general'
                  )),
      difficulty  INTEGER NOT NULL DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 3),
      mode        TEXT NOT NULL DEFAULT 'official',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_questions_category
      ON questions(category);

    CREATE INDEX IF NOT EXISTS idx_questions_difficulty
      ON questions(difficulty);
  `);

  logger.info('Migrations SQLite appliquées');
}
