import type { Room, Player, Team, Match, TournamentBracket, TeamColor, GameMode, QuestionCategory, Question, ChatMessage, QuestionMode } from './game.types';
export interface ServerToClientEvents {
    'auth:success': (player: Player) => void;
    'auth:error': (reason: string) => void;
    'room:created': (room: Room) => void;
    'room:joined': (room: Room, player: Player) => void;
    'room:error': (message: string) => void;
    'lobby:updated': (players: Player[], teams: Team[]) => void;
    'lobby:teamFull': (teamColor: TeamColor) => void;
    'lobby:error': (message: string) => void;
    'tournament:started': (bracket: TournamentBracket) => void;
    'tournament:matchReady': (match: Match) => void;
    'tournament:updated': (bracket: TournamentBracket) => void;
    'tournament:finished': (winner: TeamColor) => void;
    'match:modeRequest': (activeTeam: TeamColor) => void;
    'match:modeChosen': (mode: GameMode) => void;
    'match:questionRequest': (adverseTeam: TeamColor) => void;
    'match:questionPending': (question: Question) => void;
    'match:questionValidated': (question: Question) => void;
    'match:questionRefused': () => void;
    'match:respondentChosen': (playerId: string) => void;
    'match:answerSubmitted': (playerId: string) => void;
    'match:answerValidated': (correct: boolean) => void;
    'match:answerRefused': (attemptsLeft: number) => void;
    'match:timerStart': (duration: number, phase: string) => void;
    'match:timerUpdate': (remaining: number) => void;
    'match:timerEnd': () => void;
    'match:roundResult': (winner: TeamColor | 'draw') => void;
    'match:lifeUpdate': (teamColor: TeamColor, lives: number) => void;
    'match:teamEliminated': (teamColor: TeamColor) => void;
    'auction:bidUpdate': (teamColor: TeamColor, amount: number) => void;
    'auction:bidTurn': (teamColor: TeamColor, timeLeft: number) => void;
    'auction:won': (teamColor: TeamColor, amount: number) => void;
    'joker:timeAdded': (teamColor: TeamColor, newDuration: number) => void;
    'joker:hintRevealed': (hint: string) => void;
    'joker:error': (message: string) => void;
    'chat:message': (msg: ChatMessage) => void;
    'pong': () => void;
    'judge:disconnected': () => void;
    'player:disconnected': (playerId: string) => void;
}
export interface ClientToServerEvents {
    'room:create': (pseudo: string, questionMode: QuestionMode) => void;
    'room:join': (code: string, pseudo: string) => void;
    'lobby:chooseTeam': (teamColor: TeamColor) => void;
    /** Juge uniquement : démarre le tournoi */
    'lobby:ready': () => void;
    'match:chooseMode': (mode: GameMode) => void;
    'match:submitQuestion': (text: string, category: QuestionCategory) => void;
    'judge:validateQuestion': (approved: boolean) => void;
    'judge:validateAnswer': (approved: boolean) => void;
    'match:submitAnswer': (answer: string) => void;
    'auction:bid': (amount: number) => void;
    'joker:useTime': () => void;
    'joker:useHint': () => void;
    'chat:send': (text: string) => void;
    'ping': () => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    playerId: string;
    pseudo: string;
    role: import('./game.types').Role;
    roomCode: string | null;
}
//# sourceMappingURL=socket.types.d.ts.map