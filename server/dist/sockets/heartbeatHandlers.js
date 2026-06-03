"use strict";
// ============================================================
// BattleMind Server — Heartbeat Handler
// Détecte les déconnexions Wi-Fi silencieuses via ping/pong.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHeartbeat = registerHeartbeat;
const constants_1 = require("@shared/constants");
const logger_1 = require("../logger/logger");
/**
 * Enregistre le handler heartbeat pour un socket donné.
 *
 * - Le client envoie 'ping' toutes les HEARTBEAT_INTERVAL ms.
 * - Si le serveur ne reçoit pas de ping après HEARTBEAT_TIMEOUT,
 *   le joueur est considéré déconnecté et le socket est coupé.
 */
function registerHeartbeat(socket) {
    let missedPings = 0;
    const MAX_MISSED = 3;
    const checkInterval = constants_1.GAME_CONSTANTS.HEARTBEAT_TIMEOUT / MAX_MISSED;
    const interval = setInterval(() => {
        missedPings++;
        if (missedPings >= MAX_MISSED) {
            logger_1.logger.warn('Joueur déconnecté par timeout heartbeat', {
                socketId: socket.id,
                pseudo: socket.data.pseudo ?? 'unknown',
            });
            clearInterval(interval);
            socket.disconnect(true);
        }
    }, checkInterval);
    // Réinitialise le compteur à chaque ping reçu
    socket.on('ping', () => {
        missedPings = 0;
        socket.emit('pong');
    });
    // Nettoyage à la déconnexion normale
    socket.on('disconnect', () => {
        clearInterval(interval);
    });
}
//# sourceMappingURL=heartbeatHandlers.js.map