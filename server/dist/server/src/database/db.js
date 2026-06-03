"use strict";
// ============================================================
// BattleMind Server — Base de données SQLite
// Initialisation et connexion via better-sqlite3
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const logger_1 = require("../logger/logger");
const seeds_1 = require("./seeds");
let db;
/**
 * Initialise la connexion SQLite et crée les tables si nécessaire.
 * Doit être appelé une seule fois au démarrage du serveur.
 */
function initDatabase() {
    const dbPath = path_1.default.resolve(config_1.config.db.path);
    const dbDir = path_1.default.dirname(dbPath);
    // Crée le dossier data/ si inexistant
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    db = new better_sqlite3_1.default(dbPath);
    // Active le mode WAL pour de meilleures performances
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    (0, seeds_1.seedQuestions)(db);
    logger_1.logger.info('Base de données SQLite initialisée', { path: dbPath });
    return db;
}
/**
 * Retourne l'instance de la base de données.
 * initDatabase() doit avoir été appelé avant.
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}
// ─── Migrations ──────────────────────────────────────────────
function runMigrations(database) {
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
    logger_1.logger.info('Migrations SQLite appliquées');
}
//# sourceMappingURL=db.js.map