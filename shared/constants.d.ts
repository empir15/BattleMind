export declare const GAME_CONSTANTS: {
    readonly TEAMS: readonly ["blue", "red", "yellow", "white"];
    readonly MIN_PLAYERS_PER_TEAM: 2;
    readonly MAX_PLAYERS_PER_TEAM: 5;
    readonly MAX_LIVES: 2;
    /** Temps de réponse en mode Discussion */
    readonly DISCUSSION_TIMER: 10;
    /** Temps total pour fournir les réponses en mode Enchère */
    readonly AUCTION_TIMER: 30;
    /** Temps par tour d'enchère */
    readonly BID_TIMER: 5;
    /** Secondes ajoutées par le Joker Temps */
    readonly JOKER_TIME_BONUS: 10;
    /** Nombre de tentatives maximum en mode Discussion */
    readonly MAX_ATTEMPTS: 2;
    /** Intervalle auquel le client envoie un ping */
    readonly HEARTBEAT_INTERVAL: 5000;
    /** Délai max avant de considérer un joueur déconnecté */
    readonly HEARTBEAT_TIMEOUT: 15000;
    /** Longueur du code de salle généré */
    readonly ROOM_CODE_LENGTH: 6;
};
export type TeamsConstant = typeof GAME_CONSTANTS.TEAMS[number];
//# sourceMappingURL=constants.d.ts.map