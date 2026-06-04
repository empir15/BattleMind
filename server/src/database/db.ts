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

export function initDatabase(): Database.Database {
  let dbPath = path.resolve(config.db.path);
  let dbDir = path.dirname(dbPath);

  try {
    // Crée le dossier data/ si inexistant
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
  } catch (error: any) {
    // En cas d'erreur de permission (ex: Render gratuit sans disque avec /var/data)
    if (error.code === 'EACCES') {
      logger.warn(`Erreur de permission d'accès à ${dbPath}. Repli automatique vers ./data/battlemind.db (stockage éphémère).`, { error: error.message });
      dbPath = path.resolve('./data/battlemind.db');
      dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      db = new Database(dbPath);
    } else {
      logger.error(`Échec de l'initialisation de la base de données à ${dbPath}`, { error: error.message });
      throw error;
    }
  }

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
