// ============================================================
// BattleMind Mobile — Écran Principal (Home Screen)
// Gère la configuration de l'IP du serveur LAN et le pseudo.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { serverConfig, ConnectionMode } from '../../config/serverConfig';

// Nouveaux composants UI animés
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const [serverIp, setServerIp] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isIpFocused, setIsIpFocused] = useState(false);
  const [isPseudoFocused, setIsPseudoFocused] = useState(false);

  // Charger les valeurs persistées lors du montage du composant
  useEffect(() => {
    setServerIp(serverConfig.getServerIp());
    setPseudo(serverConfig.getLastPseudo());
    setIsOnline(serverConfig.getConnectionMode() === 'online');
  }, []);

  const handleNext = () => {
    const cleanIp = serverIp.trim();
    const cleanPseudo = pseudo.trim();
    const mode: ConnectionMode = isOnline ? 'online' : 'local';

    if (!cleanPseudo) {
      Alert.alert('Erreur', 'Veuillez saisir votre pseudo de jeu.');
      return;
    }

    if (cleanPseudo.length < 2 || cleanPseudo.length > 20) {
      Alert.alert('Pseudo Invalide', 'Votre pseudo doit faire entre 2 et 20 caractères.');
      return;
    }

    if (!isOnline) {
      // Expression régulière simple pour valider un format IP (ex: 192.168.1.50)
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

      if (!cleanIp) {
        Alert.alert('Erreur', 'Veuillez saisir l\'adresse IP locale du serveur PC.');
        return;
      }

      if (!ipRegex.test(cleanIp)) {
        Alert.alert('IP Invalide', 'Le format de l\'adresse IP est incorrect (ex: 192.168.1.15).');
        return;
      }
    }

    // Sauvegarde en local persistant MMKV
    serverConfig.setConnectionMode(mode);
    if (!isOnline) {
      serverConfig.setServerIp(cleanIp);
    }
    serverConfig.setLastPseudo(cleanPseudo);

    // Navigation vers la sélection du rôle (Juge ou Joueur)
    navigation.navigate('RoleSelection');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>BATTLE<Text style={styles.accentText}>MIND</Text></Text>
          <Text style={styles.subtitle}>CONFIGURATION RÉSEAU</Text>
        </View>

        {/* Carte de configuration */}
        <GlassCard>
          {/* Champ Pseudo */}
          <Text style={styles.label}>PSEUDO DU JOUEUR</Text>
          <TextInput
            style={[styles.input, isPseudoFocused && styles.inputActive]}
            value={pseudo}
            onChangeText={setPseudo}
            placeholder="Ex: AlphaWarrior"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            maxLength={20}
            onFocus={() => setIsPseudoFocused(true)}
            onBlur={() => setIsPseudoFocused(false)}
          />

          {/* Switch Mode Online/Local */}
          <View style={styles.modeContainer}>
            <View>
              <Text style={styles.modeLabel}>MODE ONLINE</Text>
              <Text style={styles.modeDescription}>
                {isOnline ? 'Jouer sur Internet' : 'Jouer sur Réseau Local (LAN)'}
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#2D3748', true: colors.primary + '80' }}
              thumbColor={isOnline ? colors.primary : '#A0AEC0'}
              ios_backgroundColor="#2D3748"
              onValueChange={setIsOnline}
              value={isOnline}
            />
          </View>

          {/* Champ IP (Affiché uniquement si non Online) */}
          {!isOnline && (
            <>
              <Text style={[styles.label, { marginTop: spacing.lg }]}>ADRESSE IP DU SERVEUR (LAN)</Text>
              <TextInput
                style={[styles.input, isIpFocused && styles.inputActive]}
                value={serverIp}
                onChangeText={setServerIp}
                placeholder="Ex: 192.168.1.15"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setIsIpFocused(true)}
                onBlur={() => setIsIpFocused(false)}
              />
              <Text style={styles.infoText}>
                L'IP s'affiche sur la console du serveur PC au démarrage. Assurez-vous d'être connecté au même Wi-Fi.
              </Text>
            </>
          )}

          {isOnline && (
            <View style={styles.onlineInfoContainer}>
              <Text style={styles.onlineInfoLabel}>🌐 SERVEUR CIBLE</Text>
              <Text style={styles.onlineInfoUrl} numberOfLines={1}>
                {serverConfig.getOnlineUrl()}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Bouton Suivant */}
        <NeonButton 
          title="Se Connecter" 
          onPress={handleNext} 
          style={{ marginTop: spacing.xl }}
        />
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
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  accentText: {
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  modeDescription: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: '#2D3748',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
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
  },
  onlineInfoContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(99, 179, 237, 0.08)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  onlineInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  onlineInfoUrl: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
