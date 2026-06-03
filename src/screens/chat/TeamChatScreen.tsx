// ============================================================
// BattleMind Mobile — Écran de Chat d'Équipe (Team Chat)
// Chat privé accessible en overlay pendant le match.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useGameStore } from '../../stores/useGameStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { socket } from '../../socket/socketClient';
import type { ChatMessage } from '@shared/game.types';

export default function TeamChatScreen({ navigation }: any): React.JSX.Element {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const pseudo = useAuthStore((state) => state.pseudo);
  const messages = useGameStore((state) => state.chatMessages);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    socket?.emit('chat:send', text);
    setInputText('');
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderPseudo === pseudo;
    const teamColor = colors.teams[item.teamColor as keyof typeof colors.teams] || '#FFFFFF';

    return (
      <View style={[styles.messageRow, isMyMessage && styles.messageRowRight]}>
        {!isMyMessage && (
          <View style={[styles.avatarDot, { backgroundColor: teamColor }]} />
        )}

        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.theirBubble,
          ]}
        >
          {!isMyMessage && (
            <Text style={[styles.senderName, { color: teamColor }]}>
              {item.senderPseudo}
            </Text>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← RETOUR</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CHAT ÉQUIPE 💬</Text>
        <View style={{ width: 70 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Liste des messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun message pour l'instant.</Text>
              <Text style={styles.emptySubText}>Coordonnez-vous avec votre équipe ici !</Text>
            </View>
          }
        />

        {/* Input zone */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message à votre équipe..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: '#233044',
  },
  backButton: {
    width: 70,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  messagesContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  myBubble: {
    backgroundColor: 'rgba(0, 255, 212, 0.12)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderColor: '#233044',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: '#233044',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: '#2D3748',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    shadowOpacity: 0,
  },
  sendIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '900',
  },
});
