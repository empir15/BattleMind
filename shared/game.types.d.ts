export type Role = 'judge' | 'player';
export type TeamColor = 'blue' | 'red' | 'yellow' | 'white';
export type GameMode = 'discussion' | 'auction';
export type QuestionMode = 'free' | 'official';
export type TournamentPhase = 'semi-final' | 'final';
export type QuestionCategory = 'geography' | 'history' | 'sciences' | 'sport' | 'music' | 'cinema' | 'computing' | 'africa' | 'cameroon' | 'general';
export interface Player {
    /** UUID généré par le serveur à la connexion */
    id: string;
    pseudo: string;
    teamColor: TeamColor | null;
    isCaptain: boolean;
    role: Role;
    socketId: string;
    /** Timestamp du dernier heartbeat reçu (côté serveur) */
    lastPing?: number;
}
export interface Team {
    color: TeamColor;
    players: Player[];
    /** Vies restantes — max 2 */
    lives: number;
    /** true = joker disponible, false = déjà utilisé */
    jokerTime: boolean;
    jokerHint: boolean;
    score: number;
}
/**
 * Type Question PARTAGÉ — ne contient PAS la réponse.
 * La réponse (answer) est uniquement dans QuestionInternal
 * côté serveur et ne doit JAMAIS être envoyée aux clients.
 */
export interface Question {
    id: string;
    text: string;
    /** Envoyé uniquement si le Joker Indice est activé */
    hint?: string;
    category: QuestionCategory;
    mode: QuestionMode;
}
export type MatchStatus = 'pending' | 'ongoing' | 'finished';
export interface Match {
    id: string;
    teamA: TeamColor;
    teamB: TeamColor;
    phase: TournamentPhase;
    currentMode: GameMode | null;
    /** Équipe dont c'est le tour de jouer */
    activeTeam: TeamColor | null;
    status: MatchStatus;
    winnerId: TeamColor | null;
}
export interface TournamentBracket {
    /** Demi-finale 1 : Bleu vs Rouge */
    semiFinal1: Match;
    /** Demi-finale 2 : Jaune vs Blanc */
    semiFinal2: Match;
    /** Finale — null tant que les deux demi-finales ne sont pas terminées */
    final: Match | null;
}
export type RoomStatus = 'waiting' | 'in-lobby' | 'in-match' | 'finished';
export interface Room {
    code: string;
    judgeSocketId: string;
    questionMode: QuestionMode;
    status: RoomStatus;
}
export interface ChatMessage {
    id: string;
    senderPseudo: string;
    teamColor: TeamColor;
    text: string;
    timestamp: number;
}
//# sourceMappingURL=game.types.d.ts.map