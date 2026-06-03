// ============================================================
// BattleMind Mobile — Écran de Création de Salle (Create Room)
// Permet au Juge de choisir le mode et de lancer la salle Socket.IO.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { serverConfig } from '../../config/serverConfig';
import { connectSocket, socket } from '../../socket/socketClient';
import { setupSocketListeners } from '../../socket/events';
import type { QuestionMode } from '@shared/game.types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoom'>;

export default function CreateRoomScreen({ navigation }: Props): React.JSX.Element {
  const [questionMode, setQuestionMode] = useState<QuestionMode>('official');
  const [isConnecting, setIsConnecting] = useState(false);
  const serverUrl = serverConfig.getServerUrl();
  const pseudo = serverConfig.getLastPseudo();

  const handleCreate = () => {
    setIsConnecting(true);

    // Initialisation et connexion du client Socket.IO
    const clientSocket = connectSocket(
      () => {
        // Callback de connexion réussie
        if (clientSocket) {
          // Installe les écouteurs d'événements
          setupSocketListeners(clientSocket);

          // Émet la demande de création de salle
          clientSocket.emit('room:create', pseudo, questionMode);
        }
      },
      (error) => {
        // Callback en cas d'erreur de connexion
        setIsConnecting(false);
        Alert.alert(
          'Erreur Réseau',
          `Impossible de joindre le serveur à l'adresse : ${serverUrl}. Vérifiez que le serveur est démarré et sur le même réseau local.`,
        );
      },
    );
  };

  // Annuler la connexion en cours et retourner en arrière
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CRÉATION</Text>
        <Text style={styles.subtitle}>D'UNE NOUVELLE PARTIE</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ADRESSE DU SERVEUR CIBLE</Text>
        <Text style={styles.serverValue}>{serverUrl}</Text>

        <Text style={[styles.label, { marginTop: spacing.lg }]}>MODE DE JEU DES QUESTIONS</Text>

        {/* Sélecteur Mode Officiel */}
        <TouchableOpacity
          style={[
            styles.modeOption,
            questionMode === 'official' && styles.modeOptionActive,
          ]}
          activeOpacity={0.8}
          onPress={() => setQuestionMode('official')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radio, questionMode === 'official' && styles.radioChecked]} />
            <Text style={styles.optionTitle}>Questions Officielles (SQLite)</Text>
          </View>
          <Text style={styles.optionDesc}>
            Les questions sont extraites aléatoirement de la base de données intégrée (100 questions officielles).
          </Text>
        </TouchableOpacity>

        {/* Sélecteur Mode Libre */}
        <TouchableOpacity
          style={[
            styles.modeOption,
            questionMode === 'free' && styles.modeOptionActive,
            { marginTop: spacing.md },
          ]}
          activeOpacity={0.8}
          onPress={() => setQuestionMode('free')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radio, questionMode === 'free' && styles.radioChecked]} />
            <Text style={styles.optionTitle}>Mode Libre (Questions custom)</Text>
          </View>
          <Text style={styles.optionDesc}>
            Les équipes adverses rédigent elles-mêmes les questions et réponses lors de leur tour. Le Juge valide manuellement.
          </Text>
        </TouchableOpacity>
      </View>

      {isConnecting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Connexion au serveur de jeu...</Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnCreate} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.btnCreateText}>CRÉER LE LOBBY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnBack} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.btnBackText}>RETOUR</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: '#233044',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  serverValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1,
  },
  modeOption: {
    backgroundColor: colors.surfaceLight,
    borderColor: '#2D3748',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  modeOptionActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioChecked: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    paddingLeft: 26,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  btnCreate: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnCreateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  btnBack: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderColor: '#2D3748',
    borderWidth: 1.5,
  },
  btnBackText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
