// ============================================================
// BattleMind Server — RoomManager
// Gère toutes les salles actives en mémoire.
// Source de vérité unique de l'état du jeu côté serveur.
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  Room,
  Player,
  Team,
  TeamColor,
  TournamentBracket,
  Match,
  GameMode,
  QuestionMode,
} from '@shared/game.types';
import { GAME_CONSTANTS } from '@shared/constants';
import { generateBracket } from '../utils/generateBracket';
import { logger } from '../logger/logger';

// ─── Types internes ──────────────────────────────────────────

export interface RoomState {
  room: Room;
  players: Map<string, Player>;      // socketId → Player
  teams: Map<TeamColor, Team>;
  bracket: TournamentBracket | null;
  currentMatchId: string | null;
}

// ─── Stockage en mémoire ─────────────────────────────────────

const rooms = new Map<string, RoomState>();

// ─── Création / Rejoindre ────────────────────────────────────

export function createRoom(
  code: string,
  judgeSocketId: string,
  questionMode: QuestionMode,
): RoomState {
  const room: Room = {
    code,
    judgeSocketId,
    questionMode,
    status: 'waiting',
  };

  const teams = new Map<TeamColor, Team>();
  for (const color of GAME_CONSTANTS.TEAMS) {
    teams.set(color, {
      color,
      players: [],
      lives: GAME_CONSTANTS.MAX_LIVES,
      jokerTime: true,
      jokerHint: true,
      score: 0,
    });
  }

  const state: RoomState = {
    room,
    players: new Map(),
    teams,
    bracket: null,
    currentMatchId: null,
  };

  rooms.set(code, state);
  logger.info('Salle créée', { roomCode: code, judgeSocketId, questionMode });
  return state;
}

export function getRoomByCode(code: string): RoomState | null {
  return rooms.get(code) ?? null;
}

export function getRoomBySocketId(socketId: string): RoomState | null {
  for (const state of rooms.values()) {
    if (state.players.has(socketId)) return state;
  }
  return null;
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
  logger.info('Salle supprimée', { roomCode: code });
}

// ─── Joueurs ─────────────────────────────────────────────────

export function addPlayer(code: string, player: Player): boolean {
  const state = rooms.get(code);
  if (!state) return false;
  state.players.set(player.socketId, player);
  logger.info('Joueur ajouté à la salle', {
    roomCode: code,
    pseudo: player.pseudo,
    role: player.role,
  });
  return true;
}

export function removePlayer(socketId: string): RoomState | null {
  const state = getRoomBySocketId(socketId);
  if (!state) return null;

  const player = state.players.get(socketId);
  if (player) {
    // Retirer le joueur de son équipe
    if (player.teamColor) {
      const team = state.teams.get(player.teamColor);
      if (team) {
        team.players = team.players.filter(p => p.socketId !== socketId);
        // Recalculer le capitaine si nécessaire
        if (player.isCaptain && team.players.length > 0) {
          team.players[0].isCaptain = true;
        }
      }
    }
    state.players.delete(socketId);
    logger.warn('Joueur retiré de la salle', {
      roomCode: state.room.code,
      pseudo: player.pseudo,
    });
  }

  return state;
}

export function getPlayers(code: string): Player[] {
  const state = rooms.get(code);
  if (!state) return [];
  return Array.from(state.players.values());
}

// ─── Équipes ─────────────────────────────────────────────────

/**
 * Assigne un joueur à une équipe.
 * Vérifie les contraintes (max joueurs, équipe pleine).
 */
export function assignTeam(
  socketId: string,
  teamColor: TeamColor,
  roomCode: string,
): { success: true } | { success: false; error: string } {
  const state = rooms.get(roomCode);
  if (!state) return { success: false, error: 'Salle introuvable.' };

  const player = state.players.get(socketId);
  if (!player) return { success: false, error: 'Joueur introuvable.' };

  const team = state.teams.get(teamColor);
  if (!team) return { success: false, error: 'Équipe introuvable.' };

  if (team.players.length >= GAME_CONSTANTS.MAX_PLAYERS_PER_TEAM) {
    return { success: false, error: 'Cette équipe est pleine (max 5 joueurs).' };
  }

  // Retirer de l'ancienne équipe si nécessaire
  if (player.teamColor) {
    const oldTeam = state.teams.get(player.teamColor);
    if (oldTeam) {
      oldTeam.players = oldTeam.players.filter(p => p.socketId !== socketId);
    }
  }

  // Assigner à la nouvelle équipe
  player.teamColor = teamColor;
  // Premier joueur dans l'équipe = capitaine
  player.isCaptain = team.players.length === 0;
  team.players.push(player);

  return { success: true };
}

export function getTeams(code: string): Team[] {
  const state = rooms.get(code);
  if (!state) return [];
  return Array.from(state.teams.values());
}

// ─── Tournoi ─────────────────────────────────────────────────

/**
 * Vérifie que toutes les équipes respectent les contraintes
 * avant de démarrer le tournoi.
 */
export function validateTeamsForStart(code: string): { valid: true } | { valid: false; error: string } {
  const state = rooms.get(code);
  if (!state) return { valid: false, error: 'Salle introuvable.' };

  for (const [color, team] of state.teams) {
    if (team.players.length < GAME_CONSTANTS.MIN_PLAYERS_PER_TEAM) {
      return {
        valid: false,
        error: `L'équipe ${color} n'a pas assez de joueurs (min ${GAME_CONSTANTS.MIN_PLAYERS_PER_TEAM}).`,
      };
    }
  }

  return { valid: true };
}

export function startTournament(code: string): TournamentBracket | null {
  const state = rooms.get(code);
  if (!state) return null;

  state.bracket = generateBracket();
  state.room.status = 'in-match';

  logger.info('Tournoi démarré', { roomCode: code });
  return state.bracket;
}

// ─── Vies ────────────────────────────────────────────────────

export function loseLife(
  code: string,
  teamColor: TeamColor,
): { lives: number; eliminated: boolean } {
  const state = rooms.get(code);
  if (!state) return { lives: 0, eliminated: true };

  const team = state.teams.get(teamColor);
  if (!team) return { lives: 0, eliminated: true };

  team.lives = Math.max(0, team.lives - 1);
  const eliminated = team.lives === 0;

  logger.info('Équipe perd une vie', {
    roomCode: code,
    team: teamColor,
    livesRemaining: team.lives,
    eliminated,
  });

  return { lives: team.lives, eliminated };
}
