// ============================================================
// BattleMind Mobile — Écran Rejoindre une Salle (Join Room)
// Permet aux Joueurs de saisir le code de salle et de s'y connecter.
// ============================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { serverConfig } from '../../config/serverConfig';
import { connectSocket } from '../../socket/socketClient';
import { setupSocketListeners } from '../../socket/events';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinRoom'>;

export default function JoinRoomScreen({ navigation }: Props): React.JSX.Element {
  const [roomCode, setRoomCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const serverUrl = serverConfig.getServerUrl();
  const pseudo = serverConfig.getLastPseudo();

  const handleJoin = () => {
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanCode) {
      Alert.alert('Erreur', 'Veuillez saisir le code de la salle à rejoindre.');
      return;
    }

    if (cleanCode.length !== 6) {
      Alert.alert('Code Invalide', 'Le code de la salle doit comporter exactement 6 caractères.');
      return;
    }

    setIsConnecting(true);

    // Initialisation et connexion du client Socket.IO
    const clientSocket = connectSocket(
      () => {
        // Callback de connexion réussie
        if (clientSocket) {
          // Installe les écouteurs d'événements
          setupSocketListeners(clientSocket);

          // Émet la demande de connexion à la salle
          clientSocket.emit('room:join', cleanCode, pseudo);
        }
      },
      (error) => {
        // Callback en cas d'erreur de connexion
        setIsConnecting(false);
        Alert.alert(
          'Erreur Réseau',
          `Impossible de joindre le serveur à l'adresse : ${serverUrl}. Assurez-vous d'être connecté au bon réseau Wi-Fi.`,
        );
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>CONNEXION</Text>
          <Text style={styles.subtitle}>REJOINDRE LE TOURNOI</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>SERVEUR DE JEU</Text>
          <Text style={styles.serverValue}>{serverUrl}</Text>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>CODE DE LA SALLE (6 CARACTÈRES)</Text>
          <TextInput
            style={[styles.input, isFocused && styles.inputActive]}
            value={roomCode}
            onChangeText={setRoomCode}
            placeholder="Ex: A3KZ7B"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Text style={styles.infoText}>
            Demandez le code à 6 caractères affiché sur l'écran du Juge (administrateur).
          </Text>
        </View>

        {isConnecting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Connexion et authentification...</Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btnJoin} onPress={handleJoin} activeOpacity={0.8}>
              <Text style={styles.btnJoinText}>REJOINDRE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.btnBackText}>RETOUR</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
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
    color: colors.primary,
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
    color: colors.primary,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: '#2D3748',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
  },
  inputActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  infoText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 16,
    textAlign: 'center',
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
  btnJoin: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnJoinText: {
    color: '#000000',
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
