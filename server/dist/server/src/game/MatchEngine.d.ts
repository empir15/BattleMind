import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@shared/socket.types';
import type { TeamColor, GameMode, QuestionCategory } from '@shared/game.types';
import type { QuestionInternal } from '../questions/questionRepository';
type BattleMindServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export interface MatchState {
    matchId: string;
    teamA: TeamColor;
    teamB: TeamColor;
    phase: 'semi-final' | 'final';
    currentMode: GameMode | null;
    activeTeam: TeamColor | null;
    status: 'pending' | 'ongoing' | 'finished';
    winnerId: TeamColor | null;
    currentQuestion: QuestionInternal | null;
    questionApproved: boolean;
    submittingTeam: TeamColor | null;
    answeringTeam: TeamColor | null;
    attemptsLeft: number;
    highestBid: number;
    highestBidder: TeamColor | null;
    currentBidder: TeamColor | null;
    consecutivePasses: number;
    correctAnswersCount: number;
    submittedAnswers: string[];
    auctionRemainingTime: number;
}
export declare function getMatchState(roomCode: string): MatchState | null;
/**
 * Initialise et démarre un match spécifique du bracket.
 */
export declare function startMatch(io: BattleMindServer, roomCode: string, matchId: string): void;
/**
 * L'équipe active choisit le mode de jeu (Discussion ou Enchère).
 */
export declare function handleChooseMode(io: BattleMindServer, roomCode: string, mode: GameMode): void;
/**
 * Soumission de question par l'équipe adverse.
 */
export declare function handleSubmitQuestion(io: BattleMindServer, roomCode: string, text: string, category: QuestionCategory): void;
/**
 * Le Juge valide ou refuse la question proposée.
 */
export declare function handleValidateQuestion(io: BattleMindServer, roomCode: string, approved: boolean): void;
/**
 * Une équipe soumet une enchère numérique.
 */
export declare function handleAuctionBid(io: BattleMindServer, roomCode: string, socketId: string, amount: number): void;
/**
 * Une équipe décide de passer son tour d'enchère.
 */
export declare function handleAuctionPass(io: BattleMindServer, roomCode: string, socketId: string): void;
/**
 * Soumission de réponse par un joueur de l'équipe qui a la main.
 */
export declare function handleSubmitAnswer(io: BattleMindServer, roomCode: string, socketId: string, answer: string): void;
/**
 * Le Juge valide ou refuse la réponse soumise par le joueur.
 */
export declare function handleValidateAnswer(io: BattleMindServer, roomCode: string, approved: boolean): void;
/**
 * Joker temps : Ajoute du temps au timer en cours.
 */
export declare function handleUseTimeJoker(io: BattleMindServer, roomCode: string, socketId: string): void;
/**
 * Joker Indice : Révèle l'indice de la question courante.
 */
export declare function handleUseHintJoker(io: BattleMindServer, roomCode: string, socketId: string): void;
export {};
//# sourceMappingURL=MatchEngine.d.ts.map