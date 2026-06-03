// ============================================================
// BattleMind Mobile — Écran de Match (Match Board)
// Coeur du gameplay : gère la sélection de mode, la saisie
// de questions, les enchères, les réponses et les jokers.
// ============================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useGameStore } from '../../stores/useGameStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { socket } from '../../socket/socketClient';
import type { QuestionCategory } from '@shared/game.types';

// Nouveaux composants UI animés
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';
import LifeBar from '../../components/ui/LifeBar';
import CountdownTimer from '../../components/ui/CountdownTimer';

export default function MatchScreen({ navigation }: any): React.JSX.Element {
  const pseudo = useAuthStore((state) => state.pseudo);
  const playerTeam = useRoomStore((state) => {
    const player = state.players.find((p) => p.pseudo === pseudo);
    return player?.teamColor;
  });

  // Zustand Game State
  const currentMatch = useGameStore((state) => state.currentMatch);
  const activeTeam = useGameStore((state) => state.activeTeam);
  const currentMode = useGameStore((state) => state.currentMode);
  const submittingTeam = useGameStore((state) => state.submittingTeam);
  const answeringTeam = useGameStore((state) => state.answeringTeam);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const attemptsLeft = useGameStore((state) => state.attemptsLeft);

  // Auction State
  const highestBid = useGameStore((state) => state.highestBid);
  const highestBidder = useGameStore((state) => state.highestBidder);
  const currentBidder = useGameStore((state) => state.currentBidder);
  const correctAnswersCount = useGameStore((state) => state.correctAnswersCount);

  // Chronomètre
  const timerRemaining = useGameStore((state) => state.timerRemaining);
  const timerPhase = useGameStore((state) => state.timerPhase);

  // local UI state
  const [questionText, setQuestionText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('general');
  const [answerInput, setAnswerInput] = useState('');
  const [customBidAmount, setCustomBidAmount] = useState('');

  // Catégories de questions officielles
  const categoriesList: { key: QuestionCategory; label: string }[] = [
    { key: 'geography', label: 'Géographie' },
    { key: 'history', label: 'Histoire' },
    { key: 'sciences', label: 'Sciences' },
    { key: 'sport', label: 'Sport' },
    { key: 'music', label: 'Musique' },
    { key: 'cinema', label: 'Cinéma' },
    { key: 'computing', label: 'Informatique' },
    { key: 'africa', label: 'Afrique' },
    { key: 'cameroon', label: 'Cameroun' },
    { key: 'general', label: 'Culture G' },
  ];

  if (!currentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initialisation du match...</Text>
      </View>
    );
  }

  // Informations d'équipes
  const roomTeams = useRoomStore((state) => state.teams);
  const myTeamData = roomTeams.find((t) => t.color === playerTeam);
  const teamAData = roomTeams.find((t) => t.color === currentMatch.teamA);
  const teamBData = roomTeams.find((t) => t.color === currentMatch.teamB);

  const isMyActiveTurn = activeTeam === playerTeam;
  const isMySubmittingTurn = submittingTeam === playerTeam;
  const isMyAnsweringTurn = answeringTeam === playerTeam;
  const isMyBiddingTurn = currentBidder === playerTeam;

  const roomMode = useRoomStore((state) => state.questionMode);

  // ─── Actions Sockets ────────────────────────────────────────

  const handleChooseMode = (mode: 'discussion' | 'auction') => {
    socket?.emit('match:chooseMode', mode);
  };

  const handleSubmitQuestion = () => {
    if (roomMode === 'free' && !questionText.trim()) {
      Alert.alert('Erreur', 'Veuillez rédiger le libellé de votre question.');
      return;
    }
    socket?.emit('match:submitQuestion', questionText, selectedCategory);
    setQuestionText('');
  };

  const handleSubmitAnswer = () => {
    if (!answerInput.trim()) return;
    socket?.emit('match:submitAnswer', answerInput);
    setAnswerInput('');
  };

  const handleBidSubmit = (amount: number) => {
    socket?.emit('auction:bid', amount);
  };

  const handleBidPass = () => {
    socket?.emit('auction:bid', 0); // 0 = Pass
  };

  const handleUseJokerTime = () => {
    socket?.emit('joker:useTime');
  };

  const handleUseJokerHint = () => {
    socket?.emit('joker:useHint');
  };

  // ─── Renders Helper ─────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* SCOREBOARD HEADER */}
      <View style={styles.scoreboard}>
        {/* Équipe A */}
        <View style={styles.teamScoreBox}>
          <Text style={[styles.teamLabel, { color: colors.teams[currentMatch.teamA as keyof typeof colors.teams] }]}>
            {currentMatch.teamA.toUpperCase()}
          </Text>
          <LifeBar 
            lives={teamAData?.lives ?? 0} 
            teamColor={colors.teams[currentMatch.teamA as keyof typeof colors.teams]} 
          />
        </View>

        <View style={styles.matchPhaseBox}>
          <CountdownTimer 
            remainingTime={timerRemaining} 
            totalTime={30} 
            phase={currentMatch.phase} 
          />
        </View>

        {/* Équipe B */}
        <View style={styles.teamScoreBox}>
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
        {/* ÉTAPE 1 : SELECTION DU MODE DE JEU */}
        {/* ========================================== */}
        {!currentMode && (
          <View style={styles.stepContainer}>
            {isMyActiveTurn ? (
              <GlassCard>
                <Text style={styles.panelTitle}>À VOUS DE CHOISIR LE MODE</Text>
                <Text style={styles.panelDesc}>
                  Votre équipe a la main. Sélectionnez la tactique de la manche :
                </Text>
                <View style={styles.rowButtons}>
                  <NeonButton 
                    title="Discussion" 
                    onPress={() => handleChooseMode('discussion')}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                  <NeonButton 
                    title="Enchère" 
                    onPress={() => handleChooseMode('auction')}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.waitingPanel}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.waitingText}>
                  L'équipe {activeTeam?.toUpperCase()} sélectionne le mode de jeu...
                </Text>
              </GlassCard>
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* ÉTAPE 2 : ADVERSE CORRIGE / RÈGLE QUESTION */}
        {/* ========================================== */}
        {currentMode && !currentQuestion && (
          <View style={styles.stepContainer}>
            {isMySubmittingTurn ? (
              <GlassCard>
                <Text style={styles.panelTitle}>PROPOSEZ UNE QUESTION</Text>
                <Text style={styles.panelDesc}>
                  Ciblez un sujet difficile pour piéger l'équipe adverse.
                </Text>

                {/* Choix de catégorie */}
                <Text style={styles.inputLabel}>CATÉGORIE</Text>
                <View style={styles.categoriesGrid}>
                  {categoriesList.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryChip,
                        selectedCategory === cat.key && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.key)}
                    >
                      <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Saisie texte si mode Libre */}
                {roomMode === 'free' && (
                  <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.inputLabel}>LIBELLÉ DE LA QUESTION</Text>
                    <TextInput
                      style={styles.textArea}
                      value={questionText}
                      onChangeText={setQuestionText}
                      placeholder="Tapez votre question ici..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}

                <NeonButton 
                  title={roomMode === 'official' ? 'EXTRAIRE UNE QUESTION' : 'SOUMETTRE AU JUGE'}
                  onPress={handleSubmitQuestion}
                  style={{ marginTop: spacing.md }}
                />
              </GlassCard>
            ) : (
              <GlassCard style={styles.waitingPanel}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.waitingText}>
                  L'équipe {submittingTeam?.toUpperCase()} prépare la question...
                </Text>
              </GlassCard>
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* ÉTAPE 3 : ENCHÈRE BID EN COURS */}
        {/* ========================================== */}
        {currentMode === 'auction' && currentQuestion && timerPhase === 'bid' && (
          <View style={styles.stepContainer}>
            <GlassCard>
              <Text style={styles.panelTitle}>PHASE D'ENCHÈRES</Text>
              <View style={styles.bidStats}>
                <Text style={styles.statLabel}>Mise actuelle :</Text>
                <Text style={styles.statValue}>
                  {highestBid > 0 ? `${highestBid} réponse(s)` : 'Aucune offre'}
                </Text>
                {highestBidder && (
                  <Text style={[styles.statTeam, { color: colors.teams[highestBidder as keyof typeof colors.teams] }]}>
                    Proposé par {highestBidder.toUpperCase()}
                  </Text>
                )}
              </View>

              {isMyBiddingTurn ? (
                <View style={styles.bidActions}>
                  <Text style={styles.bidInstruct}>À vous d'enchérir (Chrono : {timerRemaining}s) :</Text>
                  
                  <View style={styles.bidButtonsRow}>
                    <NeonButton 
                      title={`Enchérir à ${highestBid + 1}`} 
                      onPress={() => handleBidSubmit(highestBid + 1)}
                      style={{ flex: 1, marginRight: spacing.sm }}
                    />
                    <NeonButton 
                      title="Passer" 
                      onPress={handleBidPass}
                      variant="danger"
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.waitingPanel}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.waitingText}>
                    En attente de l'enchère de {currentBidder?.toUpperCase()}...
                  </Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {/* ========================================== */}
        {/* ÉTAPE 4 : LA QUESTION EST EN COURS DE RÉPONSE */}
        {/* ========================================== */}
        {currentQuestion && (timerPhase === 'discussion' || (currentMode === 'auction' && timerPhase === 'auction')) && (
          <View style={styles.stepContainer}>
            {/* CARTE DE QUESTION */}
            <GlassCard style={styles.questionCard}>
              <View style={styles.qHeader}>
                <Text style={styles.qCat}>CATÉGORIE : {currentQuestion.category.toUpperCase()}</Text>
                <Text style={styles.qMode}>MODE : {currentMode?.toUpperCase()}</Text>
              </View>
              <Text style={styles.qText}>{currentQuestion.text}</Text>

              {currentQuestion.hint && (
                <View style={styles.hintBox}>
                  <Text style={styles.hintLabel}>💡 INDICE :</Text>
                  <Text style={styles.hintText}>{currentQuestion.hint}</Text>
                </View>
              )}
            </GlassCard>

            {isMyAnsweringTurn ? (
              <GlassCard style={{ marginTop: spacing.md }}>
                <Text style={styles.panelTitleAnswering}>
                  {currentMode === 'discussion'
                    ? `À VOUS DE RÉPONDRE (${attemptsLeft} essai(s))`
                    : `MISES À ASSURER : ${correctAnswersCount} / ${highestBid}`}
                </Text>

                <TextInput
                  style={styles.inputAnswer}
                  value={answerInput}
                  onChangeText={setAnswerInput}
                  placeholder="Écrivez votre réponse ici..."
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                />

                <NeonButton 
                  title="Soumettre Réponse" 
                  onPress={handleSubmitAnswer}
                  style={{ marginTop: spacing.md }}
                />

                {/* SECTION JOKERS */}
                <View style={styles.jokerRow}>
                  {/* Joker Temps */}
                  <TouchableOpacity
                    style={[styles.jokerButton, (!myTeamData?.jokerTime) && styles.jokerButtonDisabled]}
                    onPress={handleUseJokerTime}
                    disabled={!myTeamData?.jokerTime}
                  >
                    <Text style={styles.jokerEmoji}>⏱️</Text>
                    <Text style={styles.jokerLabel}>JOKER TEMPS (+10s)</Text>
                  </TouchableOpacity>

                  {/* Joker Indice */}
                  <TouchableOpacity
                    style={[styles.jokerButton, (!myTeamData?.jokerHint || !currentQuestion.hint) && styles.jokerButtonDisabled]}
                    onPress={handleUseJokerHint}
                    disabled={!myTeamData?.jokerHint || !currentQuestion.hint}
                  >
                    <Text style={styles.jokerEmoji}>💡</Text>
                    <Text style={styles.jokerLabel}>JOKER INDICE</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.waitingPanel}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.waitingText}>
                  L'équipe {answeringTeam?.toUpperCase()} formule sa réponse...
                </Text>
              </GlassCard>
            )}
          </View>
        )}
      </ScrollView>

      {/* FLOATING TEAM CHAT BUTTON */}
      {playerTeam && (
        <TouchableOpacity
          style={styles.chatFab}
          onPress={() => navigation.navigate('TeamChat')}
          activeOpacity={0.8}
        >
          <Text style={styles.chatFabEmoji}>💬</Text>
          <Text style={styles.chatFabLabel}>CHAT ÉQUIPE</Text>
        </TouchableOpacity>
      )}
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
  teamScoreBox: {
    alignItems: 'center',
    width: '35%',
  },
  teamLabel: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  teamLives: {
    fontSize: 16,
    marginTop: 2,
  },
  matchPhaseBox: {
    alignItems: 'center',
    width: '30%',
  },
  matchPhaseLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  matchTimer: {
    fontSize: 20,
    fontWeight: '950',
    color: colors.primary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  stepContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  panelTitleAnswering: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  panelDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waitingPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  waitingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(0, 255, 212, 0.1)',
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  categoryTextActive: {
    color: colors.primary,
  },
  textArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlignVertical: 'top',
  },
  bidStats: {
    alignItems: 'center',
    marginVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  statTeam: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bidActions: {
    marginTop: spacing.md,
  },
  bidInstruct: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  bidButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  questionCard: {
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 8,
  },
  qCat: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  qMode: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  qText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    textAlign: 'center',
  },
  hintBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.warning,
  },
  hintLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.warning,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  inputAnswer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  jokerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  jokerButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  jokerButtonDisabled: {
    opacity: 0.3,
  },
  jokerEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  jokerLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.textMuted,
    textAlign: 'center',
  },
  chatFab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  chatFabEmoji: {
    fontSize: 18,
  },
  chatFabLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
});
