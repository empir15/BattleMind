// ============================================================
// BattleMind — Types Socket.IO partagés
// Utilisés côté server (Server<C,S>) et mobile (Socket<S,C>)
// ============================================================

import type {
  Room,
  Player,
  Team,
  Match,
  TournamentBracket,
  TeamColor,
  GameMode,
  QuestionCategory,
  Question,
  ChatMessage,
  QuestionMode,
} from './game.types';

// ─── Serveur → Clients ───────────────────────────────────────

export interface ServerToClientEvents {
  // Auth
  'auth:success': (player: Player) => void;
  'auth:error': (reason: string) => void;

  // Salle
  'room:created': (room: Room) => void;
  'room:joined': (room: Room, player: Player) => void;
  'room:error': (message: string) => void;

  // Lobby
  'lobby:updated': (players: Player[], teams: Team[]) => void;
  'lobby:teamFull': (teamColor: TeamColor) => void;
  'lobby:error': (message: string) => void;

  // Tournoi
  'tournament:started': (bracket: TournamentBracket) => void;
  'tournament:matchReady': (match: Match) => void;
  'tournament:updated': (bracket: TournamentBracket) => void;
  'tournament:finished': (winner: TeamColor) => void;

  // Match — Général
  'match:modeRequest': (activeTeam: TeamColor) => void;
  'match:modeChosen': (mode: GameMode) => void;

  // Match — Questions
  'match:questionRequest': (adverseTeam: TeamColor) => void;
  'match:questionPending': (question: Question) => void;
  'match:questionValidated': (question: Question) => void;
  'match:questionRefused': () => void;

  // Match — Réponses
  'match:respondentChosen': (playerId: string) => void;
  'match:answerSubmitted': (playerId: string) => void;
  'match:answerValidated': (correct: boolean) => void;
  'match:answerRefused': (attemptsLeft: number) => void;

  // Match — Timer
  'match:timerStart': (duration: number, phase: string) => void;
  'match:timerUpdate': (remaining: number) => void;
  'match:timerEnd': () => void;

  // Match — Résultats
  'match:roundResult': (winner: TeamColor | 'draw') => void;
  'match:lifeUpdate': (teamColor: TeamColor, lives: number) => void;
  'match:teamEliminated': (teamColor: TeamColor) => void;

  // Enchère
  'auction:bidUpdate': (teamColor: TeamColor, amount: number) => void;
  'auction:bidTurn': (teamColor: TeamColor, timeLeft: number) => void;
  'auction:won': (teamColor: TeamColor, amount: number) => void;

  // Jokers
  'joker:timeAdded': (teamColor: TeamColor, newDuration: number) => void;
  'joker:hintRevealed': (hint: string) => void;
  'joker:error': (message: string) => void;

  // Chat
  'chat:message': (msg: ChatMessage) => void;

  // Heartbeat
  'pong': () => void;

  // Système
  'judge:disconnected': () => void;
  'player:disconnected': (playerId: string) => void;
}

// ─── Clients → Serveur ───────────────────────────────────────

export interface ClientToServerEvents {
  // Salle
  'room:create': (pseudo: string, questionMode: QuestionMode) => void;
  'room:join': (code: string, pseudo: string) => void;

  // Lobby
  'lobby:chooseTeam': (teamColor: TeamColor) => void;
  /** Juge uniquement : démarre le tournoi */
  'lobby:ready': () => void;

  // Match — Mode
  'match:chooseMode': (mode: GameMode) => void;

  // Match — Questions
  'match:submitQuestion': (text: string, category: QuestionCategory) => void;

  // Match — Validation Juge
  'judge:validateQuestion': (approved: boolean) => void;
  'judge:validateAnswer': (approved: boolean) => void;

  // Match — Réponses Joueur
  'match:submitAnswer': (answer: string) => void;

  // Enchère
  'auction:bid': (amount: number) => void;

  // Jokers
  'joker:useTime': () => void;
  'joker:useHint': () => void;

  // Chat
  'chat:send': (text: string) => void;

  // Heartbeat
  'ping': () => void;
}

// ─── Événements inter-serveurs (rooms Socket.IO) ─────────────

export interface InterServerEvents {
  ping: () => void;
}

// ─── Données attachées à chaque socket ───────────────────────

export interface SocketData {
  playerId: string;
  pseudo: string;
  role: import('./game.types').Role;
  roomCode: string | null;
}
