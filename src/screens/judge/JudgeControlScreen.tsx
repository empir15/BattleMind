// ============================================================
// BattleMind Mobile — Écran de Contrôle du Juge (Judge Control)
// Panel d'administration exclusif au Juge pour approuver
// les questions, les réponses, et suivre les scores/timers.
// ============================================================

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useGameStore } from '../../stores/useGameStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { socket } from '../../socket/socketClient';

// Nouveaux composants UI animés
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';
import LifeBar from '../../components/ui/LifeBar';
import CountdownTimer from '../../components/ui/CountdownTimer';

export default function JudgeControlScreen(): React.JSX.Element {
  const currentMatch = useGameStore((state) => state.currentMatch);
  const currentMode = useGameStore((state) => state.currentMode);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const timerRemaining = useGameStore((state) => state.timerRemaining);
  const timerPhase = useGameStore((state) => state.timerPhase);
  const answeringTeam = useGameStore((state) => state.answeringTeam);

  // Auction specific
  const highestBid = useGameStore((state) => state.highestBid);
  const highestBidder = useGameStore((state) => state.highestBidder);
  const correctAnswersCount = useGameStore((state) => state.correctAnswersCount);

  // Local state for tracking incoming validation requests
  const [pendingQuestion, setPendingQuestion] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState(false);
  const [submittedAnswerText, setSubmittedAnswerText] = useState('');
  const [respondentPseudo, setRespondentPseudo] = useState('');

  const roomTeams = useRoomStore((state) => state.teams);
  const teamAData = roomTeams.find((t) => t.color === currentMatch?.teamA);
  const teamBData = roomTeams.find((t) => t.color === currentMatch?.teamB);

  useEffect(() => {
    if (!socket) return;

    // Écoute de la soumission de la question par l'équipe adverse
    socket.on('match:questionPending', () => {
      setPendingQuestion(true);
    });

    socket.on('match:questionValidated', () => {
      setPendingQuestion(false);
    });

    // Écoute de la soumission de réponse
    socket.on('match:answerSubmitted', (playerId) => {
      const allPlayers = useRoomStore.getState().players;
      const player = allPlayers.find((p) => p.id === playerId);
      setRespondentPseudo(player?.pseudo ?? 'Joueur inconnu');
      setPendingAnswer(true);
    });

    socket.on('match:answerValidated', () => {
      setPendingAnswer(false);
      setRespondentPseudo('');
    });

    socket.on('match:answerRefused', () => {
      setPendingAnswer(false);
      setRespondentPseudo('');
    });

    return () => {
      socket.off('match:questionPending');
      socket.off('match:questionValidated');
      socket.off('match:answerSubmitted');
      socket.off('match:answerValidated');
      socket.off('match:answerRefused');
    };
  }, []);

  if (!currentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Initialisation du match...</Text>
      </View>
    );
  }

  // ─── Actions Sockets ────────────────────────────────────────

  const handleValidateQuestion = (approved: boolean) => {
    socket?.emit('judge:validateQuestion', approved);
    if (!approved) {
      setPendingQuestion(false);
    }
  };

  const handleValidateAnswer = (approved: boolean) => {
    socket?.emit('judge:validateAnswer', approved);
    setPendingAnswer(false);
  };

  // ─── Render Helper ──────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* JUDGE BAR */}
      <View style={styles.judgeBar}>
        <Text style={styles.judgeBarTitle}>PANNEAU DU JUGE 👑</Text>
        <Text style={styles.judgeBarMatch}>
          {currentMatch.teamA.toUpperCase()} vs {currentMatch.teamB.toUpperCase()} ({currentMatch.phase.toUpperCase()})
        </Text>
      </View>

      {/* SCOREBOARD SUMMARY */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreRow}>
          <Text style={[styles.teamLabel, { color: colors.teams[currentMatch.teamA as keyof typeof colors.teams] }]}>
            {currentMatch.teamA.toUpperCase()}
          </Text>
          <LifeBar 
            lives={teamAData?.lives ?? 0} 
            teamColor={colors.teams[currentMatch.teamA as keyof typeof colors.teams]} 
          />
        </View>

        <View style={styles.timerBox}>
          <CountdownTimer 
            remainingTime={timerRemaining} 
            totalTime={30} 
            phase={timerPhase || 'Match'} 
          />
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.teamLabel, { color: colors.teams[currentMatch.teamB as keyof typeof colors.teams] }]}>
            {currentMatch.teamB.toUpperCase()}
          </Text>
          <LifeBar 
            lives={teamBData?.lives ?? 0} 
            teamColor={colors.teams[currentMatch.teamB as keyof typeof colors.teams]} 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ========================================== */}
        {/* CAS A : EN ATTENTE DE CHOIX DE MODE OU DE SOUMISSION */}
        {/* ========================================== */}
        {!currentMode && (
          <GlassCard style={styles.cardInfo}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <Text style={styles.cardInfoText}>
              En attente du choix de mode par l'équipe {currentMatch.activeTeam?.toUpperCase()}...
            </Text>
          </GlassCard>
        )}

        {/* ========================================== */}
        {/* CAS B : UNE QUESTION A ÉTÉ SOUMISE AU JUGE */}
        {/* ========================================== */}
        {currentMode && pendingQuestion && currentQuestion && (
          <GlassCard style={styles.cardAction}>
            <Text style={styles.cardTitle}>VALIDATION DE LA QUESTION</Text>
            <View style={styles.questionSpecs}>
              <Text style={styles.specLabel}>Catégorie : {currentQuestion.category.toUpperCase()}</Text>
              <Text style={styles.specLabel}>Type : {currentQuestion.mode.toUpperCase()}</Text>
            </View>
            <Text style={styles.questionText}>"{currentQuestion.text}"</Text>

            <View style={styles.validationButtonsRow}>
              <NeonButton 
                title="Approuver" 
                onPress={() => handleValidateQuestion(true)}
                variant="success"
                style={{ flex: 1 }}
              />
              <NeonButton 
                title="Rejeter" 
                onPress={() => handleValidateQuestion(false)}
                variant="danger"
                style={{ flex: 1 }}
              />
            </View>
          </GlassCard>
        )}

        {/* ========================================== */}
        {/* CAS C : EN ATTENTE QUE LES ENCHÈRES FINISSENT */}
        {/* ========================================== */}
        {currentMode === 'auction' && currentQuestion && timerPhase === 'bid' && (
          <GlassCard style={styles.cardInfo}>
            <Text style={styles.cardTitle}>PHASE D'ENCHÈRES</Text>
            <Text style={styles.bidSummary}>
              Mise maximale : {highestBid > 0 ? `${highestBid} réponses par ${highestBidder?.toUpperCase()}` : 'Aucune offre pour l\'instant'}
            </Text>
            <ActivityIndicator size="small" color={colors.secondary} style={{ marginTop: spacing.md }} />
          </GlassCard>
        )}

        {/* ========================================== */}
        {/* CAS D : EN ATTENTE DU JURY DES RÉPONSES */}
        {/* ========================================== */}
        {currentQuestion && (timerPhase === 'discussion' || timerPhase === 'auction') && (
          <GlassCard style={styles.cardAction}>
            <Text style={styles.cardTitle}>MANCHE EN COURS : RÉPONSES</Text>
            <Text style={styles.questionText}>Q: "{currentQuestion.text}"</Text>
            
            {currentMode === 'auction' && (
              <Text style={styles.auctionProgress}>
                Objectif de l'équipe {answeringTeam?.toUpperCase()} : {correctAnswersCount} / {highestBid} validées.
              </Text>
            )}

            {pendingAnswer ? (
              <View style={styles.submittedAnswerBox}>
                <Text style={styles.submittedTitle}>RÉPONSE DE : {respondentPseudo.toUpperCase()}</Text>
                
                <View style={styles.validationButtonsRow}>
                  <NeonButton 
                    title="Correct" 
                    onPress={() => handleValidateAnswer(true)}
                    variant="success"
                    style={{ flex: 1 }}
                  />
                  <NeonButton 
                    title="Faux" 
                    onPress={() => handleValidateAnswer(false)}
                    variant="danger"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.waitingAnswerBox}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.waitingAnswerText}>
                  Les joueurs de l'équipe {answeringTeam?.toUpperCase()} réfléchissent...
                </Text>
              </View>
            )}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: spacing.md,
  },
  judgeBar: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  judgeBarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  judgeBarMatch: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
    marginTop: 2,
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: '#233044',
  },
  scoreRow: {
    alignItems: 'center',
    width: '35%',
  },
  teamLabel: {
    fontSize: 15,
    fontWeight: '950',
    letterSpacing: 1,
  },
  livesText: {
    fontSize: 14,
    marginTop: 2,
  },
  timerBox: {
    alignItems: 'center',
    width: '30%',
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  scrollContent: {
    padding: spacing.md,
  },
  cardInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    gap: spacing.md,
  },
  cardInfoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardAction: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  questionSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  validationButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  bidSummary: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '850',
    textAlign: 'center',
  },
  auctionProgress: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  submittedAnswerBox: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.md,
  },
  submittedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  waitingAnswerBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  waitingAnswerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
