// ============================================================
// BattleMind Mobile — Typage de la Navigation
// ============================================================

import type { TeamColor } from '@shared/game.types';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  RoleSelection: undefined;
  // Rôle Juge
  CreateRoom: undefined;
  JudgeLobby: { roomCode: string };
  JudgeControl: undefined;
  // Rôle Joueur
  JoinRoom: undefined;
  TeamLobby: { roomCode: string };
  Match: undefined;
  // Écrans communs
  TournamentBracket: undefined;
  Victory: { winner: TeamColor };
  TeamChat: undefined;
};
