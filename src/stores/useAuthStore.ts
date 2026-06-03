// ============================================================
// BattleMind Mobile — Zustand Auth Store
// Gère l'identité locale du joueur, son rôle et son UUID.
// ============================================================

import { create } from 'zustand';
import type { Player, Role } from '@shared/game.types';

interface AuthState {
  playerId: string | null;
  pseudo: string;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (player: Player) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  playerId: null,
  pseudo: '',
  role: null,
  isAuthenticated: false,

  setAuth: (player) =>
    set({
      playerId: player.id,
      pseudo: player.pseudo,
      role: player.role,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      playerId: null,
      pseudo: '',
      role: null,
      isAuthenticated: false,
    }),
}));
