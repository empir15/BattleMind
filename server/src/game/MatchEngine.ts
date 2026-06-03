// ============================================================
// BattleMind Server — MatchEngine
// Gère la logique de match (Discussion & Enchère) et du tournoi.
// ============================================================

import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@shared/socket.types';
import type {
  TeamColor,
  GameMode,
  QuestionCategory,
  Question,
  Match,
  TournamentBracket,
} from '@shared/game.types';
import { GAME_CONSTANTS } from '@shared/constants';
import { logger } from '../logger/logger';
import { getRoomByCode, loseLife } from './RoomManager';
import type { QuestionInternal } from '../questions/questionRepository';
import { getRandomByCategory } from '../questions/questionRepository';
import { startTimer, stopTimer, addTime } from './TimerManager';
import { v4 as uuidv4 } from 'uuid';

type BattleMindServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export interface MatchState {
  matchId: string;
  teamA: TeamColor;
  teamB: TeamColor;
  phase: 'semi-final' | 'final';
  currentMode: GameMode | null;
  activeTeam: TeamColor | null; // Équipe qui choisit le mode et commence
  status: 'pending' | 'ongoing' | 'finished';
  winnerId: TeamColor | null;

  // État de la question
  currentQuestion: QuestionInternal | null;
  questionApproved: boolean;
  submittingTeam: TeamColor | null; // Équipe adverse qui écrit la question
  answeringTeam: TeamColor | null;  // Équipe qui doit répondre
  attemptsLeft: number;             // Tentatives restantes (mode Discussion)

  // État des enchères (mode Enchère)
  highestBid: number;
  highestBidder: TeamColor | null;
  currentBidder: TeamColor | null;
  consecutivePasses: number;
  correctAnswersCount: number;
  submittedAnswers: string[];
  auctionRemainingTime: number; // Temps restant pour le chronomètre d'enchère
}

// Map globale des états de match actifs indexés par roomCode
const activeMatches = new Map<string, MatchState>();

export function getMatchState(roomCode: string): MatchState | null {
  return activeMatches.get(roomCode) ?? null;
}

/**
 * Initialise et démarre un match spécifique du bracket.
 */
export function startMatch(
  io: BattleMindServer,
  roomCode: string,
  matchId: string,
): void {
  const roomState = getRoomByCode(roomCode);
  if (!roomState || !roomState.bracket) {
    logger.error('Impossible de démarrer le match : bracket introuvable', { roomCode, matchId });
    return;
  }

  // Trouver le match correspondant dans le bracket
  let match: Match | null = null;
  if (roomState.bracket.semiFinal1.id === matchId) match = roomState.bracket.semiFinal1;
  else if (roomState.bracket.semiFinal2.id === matchId) match = roomState.bracket.semiFinal2;
  else if (roomState.bracket.final && roomState.bracket.final.id === matchId) match = roomState.bracket.final;

  if (!match) {
    logger.error('Match non trouvé dans le bracket', { roomCode, matchId });
    return;
  }

  match.status = 'ongoing';
  roomState.currentMatchId = matchId;

  // Choix de l'équipe active initiale si non définie
  if (!match.activeTeam) {
    match.activeTeam = Math.random() < 0.5 ? match.teamA : match.teamB;
  }

  const matchState: MatchState = {
    matchId: match.id,
    teamA: match.teamA,
    teamB: match.teamB,
    phase: match.phase,
    currentMode: null,
    activeTeam: match.activeTeam,
    status: 'ongoing',
    winnerId: null,
    currentQuestion: null,
    questionApproved: false,
    submittingTeam: null,
    answeringTeam: null,
    attemptsLeft: 0,
    highestBid: 0,
    highestBidder: null,
    currentBidder: null,
    consecutivePasses: 0,
    correctAnswersCount: 0,
    submittedAnswers: [],
    auctionRemainingTime: 0,
  };

  activeMatches.set(roomCode, matchState);

  // Mettre à jour l'état de la salle
  roomState.room.status = 'in-match';

  // Notifier les clients
  io.to(roomCode).emit('tournament:updated', roomState.bracket);
  io.to(roomCode).emit('tournament:matchReady', match);
  io.to(roomCode).emit('match:modeRequest', match.activeTeam);

  logger.info('Match démarré et notifié', {
    roomCode,
    matchId,
    phase: match.phase,
    teams: `${match.teamA} vs ${match.teamB}`,
    activeTeam: match.activeTeam,
  });
}

/**
 * L'équipe active choisit le mode de jeu (Discussion ou Enchère).
 */
export function handleChooseMode(
  io: BattleMindServer,
  roomCode: string,
  mode: GameMode,
): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState) return;

  matchState.currentMode = mode;
  io.to(roomCode).emit('match:modeChosen', mode);

  // Déterminer l'équipe adverse pour soumettre la question
  const adverseTeam = matchState.activeTeam === matchState.teamA ? matchState.teamB : matchState.teamA;
  matchState.submittingTeam = adverseTeam;

  io.to(roomCode).emit('match:questionRequest', adverseTeam);

  logger.info('Mode choisi pour le match', {
    roomCode,
    matchId: matchState.matchId,
    mode,
    submittingTeam: adverseTeam,
  });
}

/**
 * Soumission de question par l'équipe adverse.
 */
export function handleSubmitQuestion(
  io: BattleMindServer,
  roomCode: string,
  text: string,
  category: QuestionCategory,
): void {
  const roomState = getRoomByCode(roomCode);
  const matchState = activeMatches.get(roomCode);
  if (!roomState || !matchState) return;

  if (roomState.room.questionMode === 'official') {
    // Mode officiel : Sélection aléatoire en base de données
    const questionDb = getRandomByCategory(category);
    if (!questionDb) {
      logger.error('Aucune question trouvée en base pour la catégorie', { category });
      io.to(roomCode).emit('room:error', 'Erreur de base de données : aucune question disponible.');
      return;
    }

    matchState.currentQuestion = questionDb;
  } else {
    // Mode libre : Question rédigée par le joueur
    matchState.currentQuestion = {
      id: uuidv4(),
      text,
      answer: 'Validation manuelle par le Juge',
      hint: 'Pas d\'indice disponible en mode libre.',
      category,
      difficulty: 1,
      mode: 'free',
    };
  }

  // Notifier le Juge pour validation
  const safeQuestion: Question = {
    id: matchState.currentQuestion.id,
    text: matchState.currentQuestion.text,
    category: matchState.currentQuestion.category,
    mode: roomState.room.questionMode,
  };

  io.to(roomCode).emit('match:questionPending', safeQuestion);

  logger.info('Question soumise au Juge', {
    roomCode,
    questionId: safeQuestion.id,
    questionText: safeQuestion.text,
    mode: roomState.room.questionMode,
  });
}

/**
 * Le Juge valide ou refuse la question proposée.
 */
export function handleValidateQuestion(
  io: BattleMindServer,
  roomCode: string,
  approved: boolean,
): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.currentQuestion) return;

  if (!approved) {
    // Question refusée par le juge -> on en redemande une à l'équipe adverse
    matchState.currentQuestion = null;
    io.to(roomCode).emit('match:questionRefused');
    if (matchState.submittingTeam) {
      io.to(roomCode).emit('match:questionRequest', matchState.submittingTeam);
    }
    logger.info('Question refusée par le Juge, nouvelle demande envoyée', { roomCode });
    return;
  }

  // Question approuvée !
  matchState.questionApproved = true;

  const safeQuestion: Question = {
    id: matchState.currentQuestion.id,
    text: matchState.currentQuestion.text,
    category: matchState.currentQuestion.category,
    mode: matchState.currentQuestion.mode as any,
  };

  io.to(roomCode).emit('match:questionValidated', safeQuestion);

  // Transition selon le mode
  if (matchState.currentMode === 'discussion') {
    // Mode Discussion : Démarrage direct du timer 10s pour l'équipe active
    matchState.answeringTeam = matchState.activeTeam;
    matchState.attemptsLeft = GAME_CONSTANTS.MAX_ATTEMPTS;

    logger.info('Démarrage phase réponse Discussion', {
      roomCode,
      answeringTeam: matchState.answeringTeam,
      duration: GAME_CONSTANTS.DISCUSSION_TIMER,
    });

    startTimer(
      io,
      roomCode,
      GAME_CONSTANTS.DISCUSSION_TIMER,
      'discussion',
      () => handleDiscussionTimeout(io, roomCode),
    );
  } else if (matchState.currentMode === 'auction') {
    // Mode Enchère : Démarrage de la phase d'enchères
    matchState.highestBid = 0;
    matchState.highestBidder = null;
    matchState.consecutivePasses = 0;

    // L'équipe active commence à enchérir
    matchState.currentBidder = matchState.activeTeam;

    logger.info('Démarrage phase Enchères', {
      roomCode,
      startingBidder: matchState.currentBidder,
    });

    startAuctionBidTurn(io, roomCode);
  }
}

/**
 * Gère le tour d'enchère pour l'équipe courante.
 */
function startAuctionBidTurn(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.currentBidder) return;

  io.to(roomCode).emit('auction:bidTurn', matchState.currentBidder, GAME_CONSTANTS.BID_TIMER);

  startTimer(
    io,
    roomCode,
    GAME_CONSTANTS.BID_TIMER,
    'bid',
    () => handleBidTimeout(io, roomCode),
  );
}

/**
 * Une équipe soumet une enchère numérique.
 */
export function handleAuctionBid(
  io: BattleMindServer,
  roomCode: string,
  socketId: string,
  amount: number,
): void {
  const matchState = activeMatches.get(roomCode);
  const roomState = getRoomByCode(roomCode);
  if (!matchState || !roomState) return;

  const player = roomState.players.get(socketId);
  if (!player || player.teamColor !== matchState.currentBidder) {
    logger.warn('Tentative d\'enchère hors tour ou invalide', { socketId, roomCode });
    return;
  }

  if (amount <= matchState.highestBid) {
    logger.warn('Montant d\'enchère trop faible', { roomCode, amount, currentHighest: matchState.highestBid });
    return;
  }

  // Arrête le timer de tour
  stopTimer(roomCode);

  matchState.highestBid = amount;
  matchState.highestBidder = matchState.currentBidder;
  matchState.consecutivePasses = 0; // Reset les passes

  io.to(roomCode).emit('auction:bidUpdate', matchState.currentBidder as TeamColor, amount);

  // Alterne le tour vers l'autre équipe du match
  const nextBidder = matchState.currentBidder === matchState.teamA ? matchState.teamB : matchState.teamA;
  matchState.currentBidder = nextBidder;

  logger.info('Enchère enregistrée', { roomCode, team: player.teamColor, amount });

  // Lance le tour suivant
  startAuctionBidTurn(io, roomCode);
}

/**
 * Une équipe décide de passer son tour d'enchère.
 */
export function handleAuctionPass(
  io: BattleMindServer,
  roomCode: string,
  socketId: string,
): void {
  const matchState = activeMatches.get(roomCode);
  const roomState = getRoomByCode(roomCode);
  if (!matchState || !roomState) return;

  const player = roomState.players.get(socketId);
  if (!player || player.teamColor !== matchState.currentBidder) {
    return;
  }

  stopTimer(roomCode);
  handlePassLogic(io, roomCode);
}

/**
 * Logique commune de pass (par action volontaire ou timeout).
 */
function handlePassLogic(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState) return;

  matchState.consecutivePasses++;

  logger.info('Équipe passe son tour d\'enchère', {
    roomCode,
    team: matchState.currentBidder,
    consecutivePasses: matchState.consecutivePasses,
  });

  // Avec 2 équipes, dès qu'une équipe passe, l'enchère se termine si l'autre a fait une offre.
  // Si aucune offre n'a encore été faite (highestBidder est null) :
  if (!matchState.highestBidder) {
    // Si les deux équipes passent de suite sans offre
    if (matchState.consecutivePasses >= 2) {
      // Offre forcée par défaut de 1 pour l'équipe active
      matchState.highestBid = 1;
      matchState.highestBidder = matchState.activeTeam;
      endAuctionBidding(io, roomCode);
    } else {
      // Premier pass, on passe le tour à l'autre équipe
      const nextBidder = matchState.currentBidder === matchState.teamA ? matchState.teamB : matchState.teamA;
      matchState.currentBidder = nextBidder;
      startAuctionBidTurn(io, roomCode);
    }
  } else {
    // Une offre existe et une équipe passe -> fin des enchères
    endAuctionBidding(io, roomCode);
  }
}

/**
 * Clôture la phase d'enchères et lance la phase de réponses.
 */
function endAuctionBidding(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.highestBidder) return;

  const winner = matchState.highestBidder;
  const target = matchState.highestBid;

  matchState.answeringTeam = winner;
  matchState.correctAnswersCount = 0;
  matchState.submittedAnswers = [];
  matchState.currentBidder = null;

  io.to(roomCode).emit('auction:won', winner, target);

  logger.info('Enchères terminées, début des réponses', {
    roomCode,
    winner,
    targetAnswersNeeded: target,
  });

  // Démarre le chrono de 30s pour fournir les réponses
  matchState.auctionRemainingTime = GAME_CONSTANTS.AUCTION_TIMER;
  startTimer(
    io,
    roomCode,
    GAME_CONSTANTS.AUCTION_TIMER,
    'auction',
    () => handleAuctionTimeout(io, roomCode),
  );
}

/**
 * Expiration du timer d'enchère de tour (5s).
 * Équivaut à un pass automatique.
 */
function handleBidTimeout(io: BattleMindServer, roomCode: string): void {
  logger.info('Timeout enchère de tour (5s)', { roomCode });
  handlePassLogic(io, roomCode);
}

/**
 * Soumission de réponse par un joueur de l'équipe qui a la main.
 */
export function handleSubmitAnswer(
  io: BattleMindServer,
  roomCode: string,
  socketId: string,
  answer: string,
): void {
  const matchState = activeMatches.get(roomCode);
  const roomState = getRoomByCode(roomCode);
  if (!matchState || !roomState) return;

  const player = roomState.players.get(socketId);
  if (!player || player.teamColor !== matchState.answeringTeam) {
    logger.warn('Tentative de réponse par un joueur non autorisé', { socketId, roomCode });
    return;
  }

  // Suspendre/Arrêter le timer pendant la validation du juge pour ne pas pénaliser les joueurs
  stopTimer(roomCode);

  // Notifier la soumission
  io.to(roomCode).emit('match:respondentChosen', player.id);
  io.to(roomCode).emit('match:answerSubmitted', player.id);

  logger.info('Réponse soumise, en attente de validation du Juge', {
    roomCode,
    player: player.pseudo,
    team: player.teamColor,
    answer,
  });
}

/**
 * Le Juge valide ou refuse la réponse soumise par le joueur.
 */
export function handleValidateAnswer(
  io: BattleMindServer,
  roomCode: string,
  approved: boolean,
): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.answeringTeam) return;

  if (matchState.currentMode === 'discussion') {
    handleDiscussionAnswerValidation(io, roomCode, approved);
  } else if (matchState.currentMode === 'auction') {
    handleAuctionAnswerValidation(io, roomCode, approved);
  }
}

/**
 * Validation de réponse en mode Discussion.
 */
function handleDiscussionAnswerValidation(
  io: BattleMindServer,
  roomCode: string,
  approved: boolean,
): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.answeringTeam) return;

  if (approved) {
    // Réponse correcte !
    io.to(roomCode).emit('match:answerValidated', true);

    if (matchState.answeringTeam === matchState.activeTeam) {
      // C'était l'équipe active qui a répondu correctement -> l'équipe adverse doit maintenant répondre à la même question
      const adverseTeam = matchState.activeTeam === matchState.teamA ? matchState.teamB : matchState.teamA;
      matchState.answeringTeam = adverseTeam;
      matchState.attemptsLeft = GAME_CONSTANTS.MAX_ATTEMPTS;

      logger.info('Équipe active correcte. L\'adverse doit répondre à la même question.', {
        roomCode,
        adverseTeam,
      });

      // Relance le timer 10s pour l'équipe adverse
      startTimer(
        io,
        roomCode,
        GAME_CONSTANTS.DISCUSSION_TIMER,
        'discussion',
        () => handleDiscussionTimeout(io, roomCode),
      );
    } else {
      // C'était l'équipe adverse qui répondait à la suite de la réussite de l'active.
      // Les deux ont réussi -> Égalité sur cette manche, pas de perte de vie.
      logger.info('Égalité sur la manche (deux équipes correctes)', { roomCode });
      io.to(roomCode).emit('match:roundResult', 'draw');
      startNextRound(io, roomCode);
    }
  } else {
    // Réponse incorrecte !
    matchState.attemptsLeft--;

    if (matchState.attemptsLeft > 0) {
      // Reste une tentative -> on relance le timer 10s pour la même équipe
      io.to(roomCode).emit('match:answerRefused', matchState.attemptsLeft);
      logger.info('Réponse incorrecte, relance pour tentative restante', { roomCode, attemptsLeft: matchState.attemptsLeft });

      startTimer(
        io,
        roomCode,
        GAME_CONSTANTS.DISCUSSION_TIMER,
        'discussion',
        () => handleDiscussionTimeout(io, roomCode),
      );
    } else {
      // Plus de tentative -> perte de vie pour cette équipe et fin de manche
      io.to(roomCode).emit('match:answerValidated', false);
      applyLifeLoss(io, roomCode, matchState.answeringTeam);
    }
  }
}

/**
 * Validation de réponse en mode Enchère.
 */
function handleAuctionAnswerValidation(
  io: BattleMindServer,
  roomCode: string,
  approved: boolean,
): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.answeringTeam) return;

  if (approved) {
    matchState.correctAnswersCount++;
    io.to(roomCode).emit('match:answerValidated', true);

    logger.info('Réponse validée positivement en Enchère', {
      roomCode,
      correctCount: matchState.correctAnswersCount,
      targetNeeded: matchState.highestBid,
    });

    if (matchState.correctAnswersCount >= matchState.highestBid) {
      // Objectif atteint ! L'équipe remporte la manche
      logger.info('Objectif d\'enchères atteint. Manche gagnée !', { roomCode, team: matchState.answeringTeam });
      io.to(roomCode).emit('match:roundResult', matchState.answeringTeam);
      startNextRound(io, roomCode);
    } else {
      // Reprendre le chrono pour les réponses restantes
      resumeAuctionTimer(io, roomCode);
    }
  } else {
    // Réponse fausse en Enchère -> n'incrémente pas le score, mais relance le chrono
    io.to(roomCode).emit('match:answerRefused', 0); // Pas de notion de tentative max en enchère
    logger.info('Réponse incorrecte en Enchère, reprise du chrono', { roomCode });

    resumeAuctionTimer(io, roomCode);
  }
}

/**
 * Reprend le chronomètre d'enchère avec le temps restant.
 */
function resumeAuctionTimer(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState) return;

  // Si le temps restant est trop court ou expiré
  if (matchState.auctionRemainingTime <= 0) {
    handleAuctionTimeout(io, roomCode);
    return;
  }

  // Pour déduire le temps écoulé de manière approximative, on garde une trace simple.
  // Lors d'une validation du juge, la reprise du timer redémarre le compte à rebours.
  // Pour éviter des dérives, on stocke la valeur restante.
  startTimer(
    io,
    roomCode,
    matchState.auctionRemainingTime,
    'auction',
    () => handleAuctionTimeout(io, roomCode),
  );
}

/**
 * Timeout discussion (10s) : consomme une tentative.
 */
function handleDiscussionTimeout(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.answeringTeam) return;

  matchState.attemptsLeft--;
  logger.info('Timeout de réponse en Discussion', { roomCode, attemptsLeft: matchState.attemptsLeft });

  if (matchState.attemptsLeft > 0) {
    io.to(roomCode).emit('match:answerRefused', matchState.attemptsLeft);
    startTimer(
      io,
      roomCode,
      GAME_CONSTANTS.DISCUSSION_TIMER,
      'discussion',
      () => handleDiscussionTimeout(io, roomCode),
    );
  } else {
    applyLifeLoss(io, roomCode, matchState.answeringTeam);
  }
}

/**
 * Timeout Enchère (30s globaux écoulés) : perte de vie.
 */
function handleAuctionTimeout(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState || !matchState.answeringTeam) return;

  logger.info('Timeout global Enchère de 30s atteint', { roomCode, team: matchState.answeringTeam });
  applyLifeLoss(io, roomCode, matchState.answeringTeam);
}

/**
 * Applique la perte de vie à une équipe et gère l'élimination/fin de match.
 */
function applyLifeLoss(
  io: BattleMindServer,
  roomCode: string,
  teamColor: TeamColor,
): void {
  const roomState = getRoomByCode(roomCode);
  const matchState = activeMatches.get(roomCode);
  if (!roomState || !matchState) return;

  const result = loseLife(roomCode, teamColor);

  // Informer de la mise à jour des vies
  io.to(roomCode).emit('match:lifeUpdate', teamColor, result.lives);

  if (result.eliminated) {
    // Équipe éliminée du match -> Fin du match !
    io.to(roomCode).emit('match:teamEliminated', teamColor);

    const winner = teamColor === matchState.teamA ? matchState.teamB : matchState.teamA;
    finishMatch(io, roomCode, winner);
  } else {
    // Manche perdue mais pas éliminée -> on passe à la manche suivante
    const roundWinner = teamColor === matchState.teamA ? matchState.teamB : matchState.teamA;
    io.to(roomCode).emit('match:roundResult', roundWinner);
    startNextRound(io, roomCode);
  }
}

/**
 * Prépare et lance la manche suivante du match actif.
 */
function startNextRound(io: BattleMindServer, roomCode: string): void {
  const matchState = activeMatches.get(roomCode);
  if (!matchState) return;

  // Réinitialisation de l'état de manche
  matchState.currentQuestion = null;
  matchState.questionApproved = false;
  matchState.submittingTeam = null;
  matchState.answeringTeam = null;
  matchState.currentMode = null;

  // Alterne l'équipe active (qui choisira le mode au prochain tour)
  matchState.activeTeam = matchState.activeTeam === matchState.teamA ? matchState.teamB : matchState.teamA;

  io.to(roomCode).emit('match:modeRequest', matchState.activeTeam);

  logger.info('Nouvelle manche lancée', {
    roomCode,
    nextActiveTeam: matchState.activeTeam,
  });
}

/**
 * Clôture le match et fait avancer l'arbre du tournoi.
 */
function finishMatch(
  io: BattleMindServer,
  roomCode: string,
  winner: TeamColor,
): void {
  const roomState = getRoomByCode(roomCode);
  const matchState = activeMatches.get(roomCode);
  if (!roomState || !roomState.bracket || !matchState) return;

  matchState.status = 'finished';
  matchState.winnerId = winner;

  // Trouver et mettre à jour le match dans le bracket
  let currentMatch: Match | null = null;
  if (roomState.bracket.semiFinal1.id === matchState.matchId) {
    currentMatch = roomState.bracket.semiFinal1;
  } else if (roomState.bracket.semiFinal2.id === matchState.matchId) {
    currentMatch = roomState.bracket.semiFinal2;
  } else if (roomState.bracket.final && roomState.bracket.final.id === matchState.matchId) {
    currentMatch = roomState.bracket.final;
  }

  if (currentMatch) {
    currentMatch.status = 'finished';
    currentMatch.winnerId = winner;
  }

  activeMatches.delete(roomCode);
  logger.info('Match terminé', { roomCode, matchId: matchState.matchId, winner });

  // Avancement du tournoi
  advanceTournament(io, roomCode);
}

/**
 * Gère l'avancement automatique dans le bracket de tournoi.
 */
function advanceTournament(io: BattleMindServer, roomCode: string): void {
  const roomState = getRoomByCode(roomCode);
  if (!roomState || !roomState.bracket) return;

  const bracket = roomState.bracket;

  // 1. Si on vient de finir la finale
  if (bracket.final && bracket.final.status === 'finished') {
    const champion = bracket.final.winnerId!;
    roomState.room.status = 'finished';
    io.to(roomCode).emit('tournament:finished', champion);
    logger.info('Tournoi terminé ! Champion couronné', { roomCode, champion });
    return;
  }

  // 2. Si les deux demi-finales sont terminées, on génère et démarre la finale
  if (
    bracket.semiFinal1.status === 'finished' &&
    bracket.semiFinal2.status === 'finished' &&
    !bracket.final
  ) {
    const finalistA = bracket.semiFinal1.winnerId!;
    const finalistB = bracket.semiFinal2.winnerId!;

    bracket.final = {
      id: uuidv4(),
      teamA: finalistA,
      teamB: finalistB,
      phase: 'final',
      currentMode: null,
      activeTeam: null,
      status: 'pending',
      winnerId: null,
    };

    io.to(roomCode).emit('tournament:updated', bracket);

    logger.info('Demi-finales complétées. Finale prête.', {
      roomCode,
      final: `${finalistA} vs ${finalistB}`,
    });

    // Lancer la finale après un petit délai de 3 secondes pour laisser le temps de voir le bracket
    setTimeout(() => {
      startMatch(io, roomCode, bracket.final!.id);
    }, 3000);

    return;
  }

  // 3. Si SF1 est finie et SF2 est en attente, on lance SF2
  if (bracket.semiFinal1.status === 'finished' && bracket.semiFinal2.status === 'pending') {
    logger.info('SF1 terminée, démarrage automatique de SF2', { roomCode });
    setTimeout(() => {
      startMatch(io, roomCode, bracket.semiFinal2.id);
    }, 3000);
    return;
  }

  // 4. Si SF2 est finie et SF1 est en attente (cas théorique si lancés dans le désordre)
  if (bracket.semiFinal2.status === 'finished' && bracket.semiFinal1.status === 'pending') {
    logger.info('SF2 terminée, démarrage automatique de SF1', { roomCode });
    setTimeout(() => {
      startMatch(io, roomCode, bracket.semiFinal1.id);
    }, 3000);
    return;
  }
}

/**
 * Joker temps : Ajoute du temps au timer en cours.
 */
export function handleUseTimeJoker(
  io: BattleMindServer,
  roomCode: string,
  socketId: string,
): void {
  const roomState = getRoomByCode(roomCode);
  const matchState = activeMatches.get(roomCode);
  if (!roomState || !matchState || !matchState.answeringTeam) return;

  const player = roomState.players.get(socketId);
  if (!player || !player.teamColor) return;

  const team = roomState.teams.get(player.teamColor);
  if (!team || team.color !== matchState.answeringTeam) {
    io.to(socketId).emit('joker:error', 'Seule l\'équipe active qui répond peut utiliser ce joker.');
    return;
  }

  if (!team.jokerTime) {
    io.to(socketId).emit('joker:error', 'Joker Temps déjà utilisé pour ce match.');
    return;
  }

  // Ajoute 10s au timer actif
  const newDuration = addTime(roomCode, GAME_CONSTANTS.JOKER_TIME_BONUS);
  if (newDuration === null) {
    io.to(socketId).emit('joker:error', 'Aucun chronomètre actif à prolonger.');
    return;
  }

  team.jokerTime = false;

  io.to(roomCode).emit('joker:timeAdded', team.color, newDuration);
  // Émet aussi la mise à jour du lobby/teams pour refléter l'utilisation du joker
  io.to(roomCode).emit('lobby:updated', Array.from(roomState.players.values()), Array.from(roomState.teams.values()));

  logger.info('Joker Temps utilisé avec succès', { roomCode, team: team.color, newDuration });
}

/**
 * Joker Indice : Révèle l'indice de la question courante.
 */
export function handleUseHintJoker(
  io: BattleMindServer,
  roomCode: string,
  socketId: string,
): void {
  const roomState = getRoomByCode(roomCode);
  const matchState = activeMatches.get(roomCode);
  if (!roomState || !matchState || !matchState.answeringTeam || !matchState.currentQuestion) return;

  const player = roomState.players.get(socketId);
  if (!player || !player.teamColor) return;

  const team = roomState.teams.get(player.teamColor);
  if (!team || team.color !== matchState.answeringTeam) {
    io.to(socketId).emit('joker:error', 'Seule l\'équipe active qui répond peut utiliser ce joker.');
    return;
  }

  if (!team.jokerHint) {
    io.to(socketId).emit('joker:error', 'Joker Indice déjà utilisé pour ce match.');
    return;
  }

  const hint = matchState.currentQuestion.hint;
  if (!hint) {
    io.to(socketId).emit('joker:error', 'Aucun indice disponible pour cette question.');
    return;
  }

  team.jokerHint = false;

  io.to(roomCode).emit('joker:hintRevealed', hint);
  io.to(roomCode).emit('lobby:updated', Array.from(roomState.players.values()), Array.from(roomState.teams.values()));

  logger.info('Joker Indice utilisé avec succès', { roomCode, team: team.color, hint });
}
