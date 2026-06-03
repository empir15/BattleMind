"use strict";
// ============================================================
// BattleMind Server — Repository des questions SQLite
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomByCategory = getRandomByCategory;
exports.getManyByCategory = getManyByCategory;
exports.getById = getById;
exports.countByCategory = countByCategory;
const db_1 = require("../database/db");
/**
 * Récupère une question aléatoire par catégorie.
 */
function getRandomByCategory(category) {
    const db = (0, db_1.getDatabase)();
    const row = db
        .prepare(`SELECT * FROM questions
       WHERE category = ?
       ORDER BY RANDOM()
       LIMIT 1`)
        .get(category);
    return row ?? null;
}
/**
 * Récupère N questions aléatoires d'une catégorie donnée.
 */
function getManyByCategory(category, limit = 5) {
    const db = (0, db_1.getDatabase)();
    return db
        .prepare(`SELECT * FROM questions
       WHERE category = ?
       ORDER BY RANDOM()
       LIMIT ?`)
        .all(category, limit);
}
/**
 * Récupère une question par son ID (pour valider la réponse côté serveur).
 */
function getById(id) {
    const db = (0, db_1.getDatabase)();
    const row = db
        .prepare('SELECT * FROM questions WHERE id = ?')
        .get(id);
    return row ?? null;
}
/**
 * Compte le total de questions disponibles par catégorie.
 */
function countByCategory() {
    const db = (0, db_1.getDatabase)();
    const rows = db
        .prepare(`SELECT category, COUNT(*) as count
       FROM questions
       GROUP BY category`)
        .all();
    return Object.fromEntries(rows.map(r => [r.category, r.count]));
}
//# sourceMappingURL=questionRepository.js.map