import Database from 'better-sqlite3';
/**
 * Initialise la connexion SQLite et crée les tables si nécessaire.
 * Doit être appelé une seule fois au démarrage du serveur.
 */
export declare function initDatabase(): Database.Database;
/**
 * Retourne l'instance de la base de données.
 * initDatabase() doit avoir été appelé avant.
 */
export declare function getDatabase(): Database.Database;
//# sourceMappingURL=db.d.ts.map