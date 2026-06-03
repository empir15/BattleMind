// ============================================================
// BattleMind Mobile — Zustand Room Store
// Stocke le code de la salle, l'état du lobby et la répartition.
// ============================================================

import { create } from 'zustand';
import type { Room, Player, Team, QuestionMode, RoomStatus } from '@shared/game.types';

interface RoomState {
  roomCode: string | null;
  roomStatus: RoomStatus | null;
  questionMode: QuestionMode | null;
  players: Player[];
  teams: Team[];

  setRoom: (room: Room) => void;
  updateLobby: (players: Player[], teams: Team[]) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  roomStatus: null,
  questionMode: null,
  players: [],
  teams: [],

  setRoom: (room) =>
    set({
      roomCode: room.code,
      roomStatus: room.status,
      questionMode: room.questionMode,
    }),

  updateLobby: (players, teams) =>
    set({
      players,
      teams,
    }),

  resetRoom: () =>
    set({
      roomCode: null,
      roomStatus: null,
      questionMode: null,
      players: [],
      teams: [],
    }),
}));
