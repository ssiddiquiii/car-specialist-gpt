import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';
import { ChatSkeletonLoader } from './SkeletonLoader';
import SidebarDrawer from './SidebarDrawer';
import AuthModal from './AuthModal';
import { SPACING, TYPE, RADIUS } from '../theme';

const { width: W } = Dimensions.get('window');
const SLIDE_W = W - 64;

const PROMPTS = [
  { id: '1', icon: 'engine-outline',         title: 'Check Engine Light',  prompt: 'My check engine light is on with code P0300. What does it mean and how do I fix it?' },
  { id: '2', icon: 'wrench-outline',         title: 'Brake Pad Guide',     prompt: 'Give me a simple guide to replace my car brake pads at home.' },
  { id: '3', icon: 'car-shift-pattern',      title: 'Compare Cars',        prompt: 'Which is better: Toyota Camry or Honda Accord? Compare reliability and mileage.' },
  { id: '4', icon: 'shield-check-outline',   title: 'Used Car Tips',       prompt: 'What should I check before buying a used car?' },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleTheme } = useThemeStore();
  const [input, setInput]         = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef  = useRef(null);
  const carouselRef = useRef(null);

  const {
    conversations, activeConversationId,
    sendMessage, isTyping,
    dualResponse, stopGeneration, chooseResponse,
    toggleSidebar,
  } = useMobileChatStore();

  const messages = conversations.find(c => c.id === activeConversationId)?.messages ?? [];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length, dualResponse]);

  const doSend = (text) => {
    const t = text ?? input;
    if (!t.trim() || isTyping) return;
    setInput('');
    setActiveTab(0);
    sendMessage(t);
  };

  const selectTab = (i) => {
    setActiveTab(i);
    carouselRef.current?.scrollTo({ x: i * (SLIDE_W + 12), animated: true });
  };

  const isLight = themeMode === 'light';

  const md = {
    body:        { ...TYPE.body,  color: colors.aiText },
    strong:      { fontWeight: '700', color: colors.textPrimary },
    code_inline: { backgroundColor: colors.bgSoft, color: colors.accent, paddingHorizontal: 4, borderRadius: 4, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    code_block:  { backgroundColor: colors.bgSoft, padding: 10, borderRadius: RADIUS.md, marginVertical: 6, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.accent },
    paragraph:   { marginTop: 0, marginBottom: 6 },
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.inner, { paddingTop: insets.top }]}>

        {/* ── HEADER ── */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity activeOpacity={0.6} style={styles.hBtn} onPress={toggleSidebar}>
            <Feather name="menu" size={19} color={colors.textSub} />
          </TouchableOpacity>
          <Text style={[styles.hTitle, { color: colors.textPrimary }]}>Car AI</Text>
          <TouchableOpacity activeOpacity={0.6} style={styles.hBtn} onPress={toggleTheme}>
            <Ionicons name={isLight ? 'moon-outline' : 'sunny-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── MESSAGE LIST ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 88 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && !dualResponse && (
            <View style={styles.empty}>
              <View style={[styles.emptyBadge, { backgroundColor: colors.accentSoft }]}>
                <MaterialCommunityIcons name="steering" size={28} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Ask anything about your car</Text>
              <Text style={[styles.emptySub, { color: colors.textSub }]}>
                Specs, repairs, diagnostics — just type below.
              </Text>
              <View style={styles.promptGrid}>
                {PROMPTS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.7}
                    style={[styles.pCard, { backgroundColor: colors.bgSoft, borderColor: colors.border }]}
                    onPress={() => doSend(p.prompt)}
                  >
                    <MaterialCommunityIcons name={p.icon} size={16} color={colors.accent} />
                    <Text style={[styles.pTitle, { color: colors.textPrimary }]}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <View key={msg.id} style={msg.role === 'user' ? styles.rowUser : styles.rowAI}>
              {msg.role === 'user' ? (
                <View style={[styles.userBubble, { backgroundColor: colors.userBubble }]}>
                  <Text style={[styles.userText]}>{msg.content}</Text>
                </View>
              ) : (
                <View style={[styles.aiBubble, { backgroundColor: colors.aiBubble }]}>
                  <Text style={[styles.aiLabel, { color: colors.textMuted }]}>Car AI</Text>
                  <Markdown style={md}>{msg.content}</Markdown>
                </View>
              )}
            </View>
          ))}

          {/* Typing skeleton */}
          {isTyping && !dualResponse?.response_a.content && <ChatSkeletonLoader />}

          {/* Dual response */}
          {dualResponse && (
            <View style={[styles.dual, { backgroundColor: colors.bgSoft, borderColor: colors.border }]}>
              <View style={styles.dualHead}>
                <Text style={[styles.dualTitle, { color: colors.textPrimary }]}>Two answers</Text>
                {isTyping && (
                  <TouchableOpacity style={styles.stopRow} onPress={stopGeneration} activeOpacity={0.8}>
                    <Ionicons name="stop-circle-outline" size={15} color="#EF4444" />
                    <Text style={styles.stopText}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tab pills */}
              <View style={[styles.tabs, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                {['Factual', 'Descriptive'].map((lbl, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    style={[styles.tab, activeTab === i && { backgroundColor: colors.accent }]}
                    onPress={() => selectTab(i)}
                  >
                    <Text style={[styles.tabText, { color: activeTab === i ? '#FFF' : colors.textMuted }]}>{lbl}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Slides */}
              <ScrollView
                ref={carouselRef}
                horizontal
                snapToInterval={SLIDE_W + 12}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={e => {
                  const i = Math.round(e.nativeEvent.contentOffset.x / (SLIDE_W + 12));
                  if (i !== activeTab && (i === 0 || i === 1)) setActiveTab(i);
                }}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingRight: 12 }}
              >
                {[
                  { key: 'a', label: 'Option A', content: dualResponse.response_a.content, col: colors.accent },
                  { key: 'b', label: 'Option B', content: dualResponse.response_b.content, col: colors.accentGreen },
                ].map(s => (
                  <View key={s.key} style={[styles.slide, { width: SLIDE_W, backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.slideLabel, { color: s.col }]}>{s.label}</Text>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator>
                      <Markdown style={md}>{s.content || (isTyping ? 'Generating…' : '')}</Markdown>
                    </ScrollView>
                    {dualResponse.streaming_complete && (
                      <TouchableOpacity
                        style={[styles.selectBtn, { backgroundColor: s.col }]}
                        activeOpacity={0.85}
                        onPress={() => chooseResponse(s.key)}
                      >
                        <Text style={styles.selectText}>Use this</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Dot indicators */}
              <View style={styles.dots}>
                {[0, 1].map(i => (
                  <View key={i} style={[styles.dot, { backgroundColor: activeTab === i ? colors.accent : colors.border }, activeTab === i && { width: 14 }]} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── FLOATING INPUT ── */}
        <View style={[styles.inputWrap, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Ask about car specs"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={800}
              onSubmitEditing={() => doSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: colors.accent }, (!input.trim() || isTyping) && { opacity: 0.3 }]}
              onPress={() => doSend()}
              disabled={!input.trim() || isTyping}
            >
              <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <SidebarDrawer />
      <AuthModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  inner: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hBtn:   { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  hTitle: { ...TYPE.heading },

  // List
  list:        { flex: 1 },
  listContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },

  // Empty state
  empty:      { alignItems: 'center', paddingTop: SPACING.xl },
  emptyBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: { ...TYPE.title, textAlign: 'center', marginBottom: SPACING.xs },
  emptySub:   { ...TYPE.body, textAlign: 'center', marginBottom: SPACING.lg },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, width: '100%' },
  pCard: {
    width: '47.5%',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pTitle: { ...TYPE.small, fontWeight: '600', flex: 1 },

  // Messages
  rowUser: { alignItems: 'flex-end', marginBottom: 10 },
  rowAI:   { alignItems: 'flex-start', marginBottom: 10 },
  userBubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.sm,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userText: { color: '#FFF', ...TYPE.body },
  aiBubble: {
    maxWidth: '88%',
    borderRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiLabel: { ...TYPE.label, marginBottom: 5 },

  // Dual card
  dual: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.md },
  dualHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  dualTitle: { ...TYPE.heading },
  stopRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopText: { ...TYPE.small, color: '#EF4444', fontWeight: '600' },
  tabs: { flexDirection: 'row', borderRadius: RADIUS.sm, padding: 3, borderWidth: 1, marginBottom: SPACING.sm },
  tab:     { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: RADIUS.sm - 2 },
  tabText: { ...TYPE.small, fontWeight: '600' },
  slide:   { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.md, marginRight: 12 },
  slideLabel: { ...TYPE.small, fontWeight: '700', marginBottom: SPACING.sm },
  selectBtn: { borderRadius: RADIUS.md, paddingVertical: 9, alignItems: 'center', marginTop: SPACING.sm },
  selectText: { color: '#FFF', ...TYPE.small, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: SPACING.sm },
  dot:  { height: 5, width: 5, borderRadius: 3 },

  // Input
  inputWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: SPACING.sm,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  input: { flex: 1, ...TYPE.body, maxHeight: 100, paddingVertical: 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
