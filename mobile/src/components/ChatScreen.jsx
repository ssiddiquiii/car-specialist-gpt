import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';
import SidebarDrawer from './SidebarDrawer';
import AuthModal from './AuthModal';
import { ChatSkeletonLoader } from './SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - 64;

const STARTER_PROMPTS = [
  {
    id: 'obd',
    title: 'Check Engine Light',
    subtitle: 'What does code P0300 mean?',
    prompt: 'My check engine light is on with code P0300. What does it mean and how do I fix it?',
    icon: 'engine-outline',
  },
  {
    id: 'repair',
    title: 'Brake Pad Guide',
    subtitle: 'How to replace brake pads?',
    prompt: 'Give me a simple guide to replace my car brake pads at home.',
    icon: 'wrench-outline',
  },
  {
    id: 'compare',
    title: 'Compare Cars',
    subtitle: 'Toyota Camry vs Honda Accord',
    prompt: 'Which is better: Toyota Camry or Honda Accord? Compare reliability and mileage.',
    icon: 'car-shift-pattern',
  },
  {
    id: 'buy',
    title: 'Used Car Tips',
    subtitle: 'What to check before buying?',
    prompt: 'What should I check before buying a used car under $10,000?',
    icon: 'shield-check-outline',
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleTheme } = useThemeStore();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [inputHeight, setInputHeight] = useState(44);
  const scrollViewRef = useRef(null);
  const carouselRef = useRef(null);

  const {
    conversations,
    activeConversationId,
    sendMessage,
    isTyping,
    dualResponse,
    stopGeneration,
    chooseResponse,
    toggleSidebar,
  } = useMobileChatStore();

  const currentConvo = conversations.find(c => c.id === activeConversationId) || { messages: [] };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentConvo.messages, dualResponse]);

  const handleSend = (overrideText) => {
    const text = overrideText || input;
    if (!text.trim() || isTyping) return;
    setInput('');
    setInputHeight(44);
    setActiveTab(0);
    sendMessage(text);
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    carouselRef.current?.scrollTo({ x: index * (SLIDE_WIDTH + 12), animated: true });
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SLIDE_WIDTH + 12));
    if (index !== activeTab && (index === 0 || index === 1)) {
      setActiveTab(index);
    }
  };

  const isLight = themeMode === 'light';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.innerContainer, { paddingTop: insets.top }]}>

        {/* COMPACT HEADER */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.headerIcon}
            onPress={toggleSidebar}
          >
            <Feather name="menu" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Car AI</Text>

          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.headerIcon}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isLight ? 'moon' : 'sunny'}
              size={19}
              color={isLight ? '#6B7280' : '#F59E0B'}
            />
          </TouchableOpacity>
        </View>

        {/* CHAT LIST */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatList}
          contentContainerStyle={[styles.chatListContent, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* EMPTY STATE */}
          {currentConvo.messages.length === 0 && !dualResponse && (
            <View style={styles.emptyContainer}>
              <View style={[styles.heroBadge, { backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}>
                <Ionicons name="car-sport" size={34} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Ask anything about your car</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Engine, repairs, specs, diagnostics — just type below.
              </Text>

              <View style={styles.promptGrid}>
                {STARTER_PROMPTS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[styles.promptCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                    onPress={() => handleSend(item.prompt)}
                  >
                    <MaterialCommunityIcons name={item.icon} size={18} color={colors.accent} style={styles.promptIcon} />
                    <Text style={[styles.promptCardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.promptCardSub, { color: colors.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* MESSAGES */}
          {currentConvo.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.msgRow,
                msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI,
              ]}
            >
              {msg.role === 'user' ? (
                <View style={[styles.userBubble, { backgroundColor: colors.userBubble }]}>
                  <Text style={styles.userText}>{msg.content}</Text>
                </View>
              ) : (
                <View style={[styles.aiBubble, { backgroundColor: colors.aiBubble, borderColor: colors.aiBubbleBorder }]}>
                  <View style={styles.aiLabel}>
                    <Ionicons name="car-sport" size={12} color={colors.accent} />
                    <Text style={[styles.aiLabelText, { color: colors.accent }]}>Car AI</Text>
                  </View>
                  <Markdown style={getMarkdownStyles(colors)}>{msg.content}</Markdown>
                </View>
              )}
            </View>
          ))}

          {/* SKELETON */}
          {isTyping && !dualResponse?.response_a.content && (
            <ChatSkeletonLoader />
          )}

          {/* DUAL ANSWER CARD */}
          {dualResponse && (
            <View style={[styles.dualCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              {/* Dual Header */}
              <View style={styles.dualHeader}>
                <Text style={[styles.dualTitle, { color: colors.textPrimary }]}>Two Answers Ready</Text>
                {isTyping && (
                  <TouchableOpacity activeOpacity={0.8} style={[styles.stopBtn, { borderColor: '#FCA5A5' }]} onPress={stopGeneration}>
                    <Ionicons name="stop-circle" size={14} color="#EF4444" />
                    <Text style={styles.stopText}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tab Switcher */}
              <View style={[styles.tabBar, { backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}>
                {['Factual', 'Descriptive'].map((label, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    style={[
                      styles.tabBtn,
                      activeTab === i && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => handleTabPress(i)}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: activeTab === i ? '#FFFFFF' : colors.textMuted },
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Slides */}
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={SLIDE_WIDTH + 12}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingRight: 12 }}
              >
                {[
                  { key: 'a', label: 'Option A · Factual', content: dualResponse.response_a.content, color: colors.accent },
                  { key: 'b', label: 'Option B · Descriptive', content: dualResponse.response_b.content, color: colors.accentCyan },
                ].map((slide) => (
                  <View key={slide.key} style={[styles.slide, { width: SLIDE_WIDTH, backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.slideLabel, { color: slide.color }]}>{slide.label}</Text>
                    <ScrollView style={styles.slideScroll} nestedScrollEnabled showsVerticalScrollIndicator>
                      <Markdown style={getMarkdownStyles(colors)}>
                        {slide.content || (isTyping ? 'Generating...' : 'No response.')}
                      </Markdown>
                    </ScrollView>
                    {dualResponse.streaming_complete && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.selectBtn, { backgroundColor: slide.color }]}
                        onPress={() => chooseResponse(slide.key)}
                      >
                        <Ionicons name="checkmark" size={15} color="#FFF" />
                        <Text style={styles.selectBtnText}>Use this answer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Page dots */}
              <View style={styles.dots}>
                {[0, 1].map(i => (
                  <View key={i} style={[styles.dot, { backgroundColor: activeTab === i ? colors.accent : colors.cardBorder }, activeTab === i && { width: 16 }]} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* FLOATING INPUT BAR */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 10 }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
            <TextInput
              style={[styles.textInput, { color: colors.inputText }]}
              placeholder="Ask about car specs"
              placeholderTextColor={colors.inputPlaceholder}
              value={input}
              onChangeText={setInput}
              multiline
              onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: colors.accent }, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <SidebarDrawer />
      <AuthModal />
    </KeyboardAvoidingView>
  );
}

const getMarkdownStyles = (colors) => ({
  body: { color: colors.aiText, fontSize: 14, lineHeight: 21 },
  strong: { fontWeight: '700', color: colors.textPrimary },
  em: { fontStyle: 'italic', color: colors.textSecondary },
  heading1: { fontSize: 16, fontWeight: '700', color: colors.accent, marginTop: 8, marginBottom: 4 },
  heading2: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 6, marginBottom: 3 },
  code_inline: { backgroundColor: colors.subCardBg, color: colors.accentCyan, paddingHorizontal: 5, borderRadius: 4, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  code_block: { backgroundColor: colors.subCardBg, borderRadius: 8, padding: 10, marginVertical: 6, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: colors.accentCyan },
  paragraph: { marginTop: 0, marginBottom: 6 },
  bullet_list: { marginVertical: 4 },
  list_item: { flexDirection: 'row', marginVertical: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1 },

  // COMPACT HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  chatList: { flex: 1 },
  chatListContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 300,
  },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  promptCard: {
    width: '47.5%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  promptIcon: { marginBottom: 8 },
  promptCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  promptCardSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // MESSAGES
  msgRow: { marginBottom: 12 },
  msgRowUser: { alignItems: 'flex-end' },
  msgRowAI: { alignItems: 'flex-start' },
  userBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  aiBubble: {
    maxWidth: '88%',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  aiLabelText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // DUAL CARD
  dualCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  dualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dualTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stopText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  slide: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    minHeight: 200,
  },
  slideLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  slideScroll: {
    maxHeight: 220,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },

  // FLOATING INPUT
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
});
