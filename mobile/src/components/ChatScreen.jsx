import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useMobileChatStore } from '../store/mobileChatStore';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const { conversations, activeConversationId, sendMessage, isTyping, dualResponse, stopGeneration, chooseResponse } = useMobileChatStore();

  const currentConvo = conversations.find(c => c.id === activeConversationId) || { messages: [] };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 Car Specialist AI</Text>
        <Text style={styles.badge}>100% OFFLINE</Text>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.chatList} contentContainerStyle={{ paddingVertical: 16 }}>
        {currentConvo.messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <Text style={styles.roleLabel}>{msg.role === 'user' ? 'You' : 'Car Specialist'}</Text>
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}

        {/* Dual Response Cards */}
        {dualResponse && (
          <View style={styles.dualCardContainer}>
            <View style={styles.dualHeader}>
              <Text style={styles.dualTitle}>Dual AI Responses (On-Device)</Text>
              {isTyping && (
                <TouchableOpacity style={styles.stopBtn} onPress={stopGeneration}>
                  <Text style={styles.stopText}>⏹ Stop</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dualCardsRow}>
              {/* Card A */}
              <View style={styles.singleCard}>
                <Text style={styles.cardLabel}>Response A (Temp 0.7)</Text>
                <ScrollView style={styles.cardScroll}>
                  <Text style={styles.cardText}>{dualResponse.response_a.content || 'Generating...'}</Text>
                </ScrollView>
                {dualResponse.streaming_complete && (
                  <TouchableOpacity style={styles.chooseBtn} onPress={() => chooseResponse('a')}>
                    <Text style={styles.chooseBtnText}>Select A</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Card B */}
              <View style={styles.singleCard}>
                <Text style={styles.cardLabel}>Response B (Temp 0.95)</Text>
                <ScrollView style={styles.cardScroll}>
                  <Text style={styles.cardText}>{dualResponse.response_b.content || 'Generating...'}</Text>
                </ScrollView>
                {dualResponse.streaming_complete && (
                  <TouchableOpacity style={styles.chooseBtn} onPress={() => chooseResponse('b')}>
                    <Text style={styles.chooseBtnText}>Select B</Text>
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
          placeholderTextColor="#64748B"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isTyping}>
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  badge: { fontSize: 10, fontWeight: '800', color: '#10B981', backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  chatList: { flex: 1, paddingHorizontal: 16 },
  messageBubble: { borderRadius: 16, padding: 14, marginBottom: 12, maxWidth: '85%' },
  userBubble: { backgroundColor: '#4F46E5', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1E293B', alignSelf: 'flex-start', borderColor: '#334155', borderWidth: 1 },
  roleLabel: { fontSize: 11, fontWeight: '700', color: '#CBD5E1', marginBottom: 4 },
  messageText: { fontSize: 14, color: '#F8FAFC', lineHeight: 20 },
  dualCardContainer: { backgroundColor: '#1E293B', borderRadius: 16, padding: 12, marginVertical: 12, borderColor: '#475569', borderWidth: 1 },
  dualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dualTitle: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  stopBtn: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stopText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dualCardsRow: { flexDirection: 'row', gap: 10 },
  singleCard: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 10, minHeight: 180, justifyContent: 'space-between' },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  cardScroll: { flex: 1, maxHeight: 160 },
  cardText: { fontSize: 12, color: '#E2E8F0', lineHeight: 17 },
  chooseBtn: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 8, marginTop: 8, alignItems: 'center' },
  chooseBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#1E293B', borderTopWidth: 1, borderColor: '#334155', alignItems: 'center', gap: 10 },
  textInput: { flex: 1, backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { backgroundColor: '#4F46E5', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFF', fontSize: 18, fontWeight: '700' }
});
