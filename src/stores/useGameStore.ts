// ============================================================
// BattleMind Mobile — Zustand Game & Match Store
// Regroupe l'état en temps réel du tournoi, du match en cours,
// des enchères, des réponses, du chronomètre et du chat d'équipe.
// ============================================================

import { create } from 'zustand';
import type {
  TournamentBracket,
  Match,
  TeamColor,
  GameMode,
  Question,
  ChatMessage,
} from '@shared/game.types';

interface GameState {
  // Arbre de tournoi
  bracket: TournamentBracket | null;
  currentMatch: Match | null;

  // Question & Rôles de match
  activeTeam: TeamColor | null;
  currentMode: GameMode | null;
  submittingTeam: TeamColor | null;
  answeringTeam: TeamColor | null;
  currentQuestion: Question | null;
  attemptsLeft: number;

  // Enchère (mode Auction)
  highestBid: number;
  highestBidder: TeamColor | null;
  currentBidder: TeamColor | null;
  correctAnswersCount: number;

  // Chronomètre global
  timerDuration: number;
  timerRemaining: number;
  timerPhase: string | null; // 'discussion', 'auction', 'bid'

  // Chat privé d'équipe
  chatMessages: ChatMessage[];

  // Fin de tournoi
  tournamentWinner: TeamColor | null;

  // Actions
  setBracket: (bracket: TournamentBracket) => void;
  setCurrentMatch: (match: Match) => void;
  setModeChosen: (mode: GameMode) => void;
  setQuestionRequest: (submittingTeam: TeamColor) => void;
  setQuestionPending: (question: Question) => void;
  setQuestionValidated: (question: Question) => void;
  setAnsweringTeam: (answeringTeam: TeamColor, attemptsLeft: number) => void;
  setAttemptsLeft: (attemptsLeft: number) => void;
  setBidUpdate: (bidder: TeamColor, amount: number) => void;
  setBidTurn: (bidder: TeamColor, duration: number) => void;
  setAuctionWon: (winner: TeamColor, amount: number) => void;
  setCorrectAnswersCount: (count: number) => void;
  setTimerStart: (duration: number, phase: string) => void;
  setTimerUpdate: (remaining: number) => void;
  setTimerEnd: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  setTournamentFinished: (winner: TeamColor) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  bracket: null,
  currentMatch: null,

  activeTeam: null,
  currentMode: null,
  submittingTeam: null,
  answeringTeam: null,
  currentQuestion: null,
  attemptsLeft: 0,

  highestBid: 0,
  highestBidder: null,
  currentBidder: null,
  correctAnswersCount: 0,

  timerDuration: 0,
  timerRemaining: 0,
  timerPhase: null,

  chatMessages: [],
  tournamentWinner: null,

  setBracket: (bracket) => set({ bracket }),

  setCurrentMatch: (match) =>
    set({
      currentMatch: match,
      activeTeam: match.activeTeam,
      currentMode: match.currentMode,
      // Réinitialise l'état de manche lors d'un nouveau match
      currentQuestion: null,
      submittingTeam: null,
      answeringTeam: null,
      highestBid: 0,
      highestBidder: null,
      currentBidder: null,
      correctAnswersCount: 0,
    }),

  setModeChosen: (currentMode) => set({ currentMode }),

  setQuestionRequest: (submittingTeam) =>
    set({
      submittingTeam,
      currentQuestion: null,
    }),

  setQuestionPending: (currentQuestion) =>
    set({
      currentQuestion,
    }),

  setQuestionValidated: (currentQuestion) =>
    set({
      currentQuestion,
    }),

  setAnsweringTeam: (answeringTeam, attemptsLeft) =>
    set({
      answeringTeam,
      attemptsLeft,
    }),

  setAttemptsLeft: (attemptsLeft) => set({ attemptsLeft }),

  setBidUpdate: (bidder, amount) =>
    set({
      highestBid: amount,
      highestBidder: bidder,
    }),

  setBidTurn: (currentBidder, duration) =>
    set({
      currentBidder,
      timerDuration: duration,
      timerRemaining: duration,
      timerPhase: 'bid',
    }),

  setAuctionWon: (winner, amount) =>
    set({
      answeringTeam: winner,
      highestBid: amount,
      correctAnswersCount: 0,
      currentBidder: null,
    }),

  setCorrectAnswersCount: (correctAnswersCount) => set({ correctAnswersCount }),

  setTimerStart: (duration, phase) =>
    set({
      timerDuration: duration,
      timerRemaining: duration,
      timerPhase: phase,
    }),

  setTimerUpdate: (remaining) => set({ timerRemaining: remaining }),

  setTimerEnd: () => set({ timerRemaining: 0 }),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    })),

  setTournamentFinished: (tournamentWinner) =>
    set({
      tournamentWinner,
    }),

  resetGame: () =>
    set({
      bracket: null,
      currentMatch: null,
      activeTeam: null,
      currentMode: null,
      submittingTeam: null,
      answeringTeam: null,
      currentQuestion: null,
      attemptsLeft: 0,
      highestBid: 0,
      highestBidder: null,
      currentBidder: null,
      correctAnswersCount: 0,
      timerDuration: 0,
      timerRemaining: 0,
      timerPhase: null,
      chatMessages: [],
      tournamentWinner: null,
    }),
}));
