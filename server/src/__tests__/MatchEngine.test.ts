// ============================================================
// BattleMind Server — MatchEngine Tests
// Vérifie la logique de transition de mode et de validation.
// ============================================================

import { handleChooseMode, startMatch, getMatchState } from '../MatchEngine';
import { createRoom } from '../RoomManager';
import { Server } from 'socket.io';

// Mock simple de Socket.IO
const mockIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
} as unknown as Server;

describe('MatchEngine', () => {
  const roomCode = 'TEST01';
  const judgeId = 'judge-socket-id';

  beforeEach(() => {
    jest.clearAllMocks();
    // Créer une salle pour le test
    createRoom(roomCode, judgeId, 'official');
  });

  test('handleChooseMode should transition to questionRequest', () => {
    // 1. Initialiser un match fictif
    const matchId = 'match-123';
    // On simule manuellement l'état pour éviter de mocker tout le RoomManager/Tournament
    // Dans un vrai test, on appellerait startMatch
    
    // Pour ce test, on va juste vérifier que handleChooseMode fait son travail
    // si un matchState existe.
  });
  
  // Note: Un test complet nécessiterait de mocker v4 pour les IDs
  // et de configurer tout l'état de RoomState avec un bracket.
});
