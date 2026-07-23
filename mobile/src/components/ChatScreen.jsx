import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useMobileChatStore } from '../store/mobileChatStore';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const { conversations, activeConversationId, sendMessage, isTyping, dualResponse, stopGeneration, chooseResponse } = useMobileChatStore();

  const currentConvo = conversations.find(c => c.id === activeConversationId) || { messages: [] };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.headerIcon} 
          />
          <Text style={styles.headerTitle}>Car Specialist AI</Text>
        </View>
        <View style={styles.offlineBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.badgeText}>100% OFFLINE</Text>
        </View>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.chatList} contentContainerStyle={{ paddingVertical: 16 }}>
        {currentConvo.messages.length === 0 && !dualResponse && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Gemma 2B Engine Ready 🚗</Text>
            <Text style={styles.emptyText}>
              Ask any question about car diagnostics, engine performance, maintenance, or vehicle recommendations.
            </Text>
          </View>
        )}

        {currentConvo.messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <Text style={[styles.roleLabel, msg.role === 'user' ? styles.userRole : styles.aiRole]}>
              {msg.role === 'user' ? 'You' : 'Gemma 2B Specialist'}
            </Text>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userMessageText : styles.aiMessageText]}>
              {msg.content}
            </Text>
          </View>
        ))}

        {/* Dual Response Cards */}
        {dualResponse && (
          <View style={styles.dualCardContainer}>
            <View style={styles.dualHeader}>
              <Text style={styles.dualTitle}>Dual Responses (On-Device Gemma 2B)</Text>
              {isTyping && (
                <TouchableOpacity activeOpacity={0.8} style={styles.stopBtn} onPress={stopGeneration}>
                  <Text style={styles.stopText}>⏹ Stop</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dualCardsRow}>
              {/* Card A */}
              <View style={styles.singleCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardLabel}>Response A</Text>
                  <Text style={styles.tempBadge}>Temp 0.7 Factual</Text>
                </View>
                <ScrollView style={styles.cardScroll}>
                  <Text style={styles.cardText}>{dualResponse.response_a.content || 'Generating Response A...'}</Text>
                </ScrollView>
                {dualResponse.streaming_complete && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.chooseBtn} onPress={() => chooseResponse('a')}>
                    <Text style={styles.chooseBtnText}>Select Response A</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Card B */}
              <View style={styles.singleCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardLabel}>Response B</Text>
                  <Text style={styles.tempBadge}>Temp 0.95 Creative</Text>
                </View>
                <ScrollView style={styles.cardScroll}>
                  <Text style={styles.cardText}>{dualResponse.response_b.content || 'Generating Response B...'}</Text>
                </ScrollView>
                {dualResponse.streaming_complete && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.chooseBtn} onPress={() => chooseResponse('b')}>
                    <Text style={styles.chooseBtnText}>Select Response B</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything about cars..."
          placeholderTextColor="#71706B"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.disabledSendBtn]} 
          onPress={handleSend} 
          disabled={!input.trim() || isTyping}
        >
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141413' // Claude warm charcoal
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1C1C1A',
    borderBottomWidth: 1,
    borderColor: '#2E2C28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#ECECEC',
    letterSpacing: -0.2,
  },
  offlineBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#10B981' 
  },
  chatList: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ECECEC',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#9F9D96',
    textAlign: 'center',
    lineHeight: 19,
  },
  messageBubble: { 
    borderRadius: 18, 
    padding: 15, 
    marginBottom: 12, 
    maxWidth: '85%' 
  },
  userBubble: { 
    backgroundColor: '#DA7756', // Claude terracotta
    alignSelf: 'flex-end' 
  },
  aiBubble: { 
    backgroundColor: '#1F1E1B', 
    alignSelf: 'flex-start', 
    borderColor: '#383632', 
    borderWidth: 1 
  },
  roleLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  aiRole: {
    color: '#DA7756',
  },
  messageText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#ECECEC',
  },
  dualCardContainer: { 
    backgroundColor: '#1C1C1A', 
    borderRadius: 18, 
    padding: 14, 
    marginVertical: 12, 
    borderColor: '#383632', 
    borderWidth: 1 
  },
  dualHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  dualTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#ECECEC' 
  },
  stopBtn: { 
    backgroundColor: '#991B1B', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  stopText: { 
    color: '#FCA5A5', 
    fontSize: 11, 
    fontWeight: '700' 
  },
  dualCardsRow: { 
    flexDirection: 'row', 
    gap: 10 
  },
  singleCard: { 
    flex: 1, 
    backgroundColor: '#141413', 
    borderRadius: 14, 
    padding: 12, 
    minHeight: 200, 
    borderColor: '#2E2C28',
    borderWidth: 1,
    justifyContent: 'space-between' 
  },
  cardHeaderRow: {
    marginBottom: 8,
  },
  cardLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#ECECEC', 
    marginBottom: 2 
  },
  tempBadge: {
    fontSize: 10,
    color: '#9F9D96',
  },
  cardScroll: { 
    flex: 1, 
    maxHeight: 180 
  },
  cardText: { 
    fontSize: 12.5, 
    color: '#D1CFCA', 
    lineHeight: 18 
  },
  chooseBtn: { 
    backgroundColor: '#DA7756', 
    borderRadius: 10, 
    paddingVertical: 9, 
    marginTop: 10, 
    alignItems: 'center' 
  },
  chooseBtnText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#1C1C1A', 
    borderTopWidth: 1, 
    borderColor: '#2E2C28', 
    alignItems: 'center', 
    gap: 10 
  },
  textInput: { 
    flex: 1, 
    backgroundColor: '#141413', 
    color: '#ECECEC', 
    borderRadius: 22, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    fontSize: 14, 
    maxHeight: 100,
    borderColor: '#383632',
    borderWidth: 1,
  },
  sendBtn: { 
    backgroundColor: '#DA7756', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledSendBtn: {
    backgroundColor: '#383632',
    opacity: 0.5,
  },
  sendIcon: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700' 
  }
});
