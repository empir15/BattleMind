import type { Room, Player, Team, TeamColor, TournamentBracket, QuestionMode } from '@shared/game.types';
export interface RoomState {
    room: Room;
    players: Map<string, Player>;
    teams: Map<TeamColor, Team>;
    bracket: TournamentBracket | null;
    currentMatchId: string | null;
}
export declare function createRoom(code: string, judgeSocketId: string, questionMode: QuestionMode): RoomState;
export declare function getRoomByCode(code: string): RoomState | null;
export declare function getRoomBySocketId(socketId: string): RoomState | null;
export declare function deleteRoom(code: string): void;
export declare function addPlayer(code: string, player: Player): boolean;
export declare function removePlayer(socketId: string): RoomState | null;
export declare function getPlayers(code: string): Player[];
/**
 * Assigne un joueur à une équipe.
 * Vérifie les contraintes (max joueurs, équipe pleine).
 */
export declare function assignTeam(socketId: string, teamColor: TeamColor, roomCode: string): {
    success: true;
} | {
    success: false;
    error: string;
};
export declare function getTeams(code: string): Team[];
/**
 * Vérifie que toutes les équipes respectent les contraintes
 * avant de démarrer le tournoi.
 */
export declare function validateTeamsForStart(code: string): {
    valid: true;
} | {
    valid: false;
    error: string;
};
export declare function startTournament(code: string): TournamentBracket | null;
export declare function loseLife(code: string, teamColor: TeamColor): {
    lives: number;
    eliminated: boolean;
};
//# sourceMappingURL=RoomManager.d.ts.map