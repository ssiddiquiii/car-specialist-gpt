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
  Platform
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
// Calculate exact slide width to avoid any side card clipping/cut-off
const PADDING_HORIZONTAL = 16;
const CAROUSEL_CONTAINER_WIDTH = SCREEN_WIDTH - (PADDING_HORIZONTAL * 2);
const SLIDE_WIDTH = CAROUSEL_CONTAINER_WIDTH - 28;

const STARTER_PROMPTS = [
  {
    id: 'obd',
    title: 'Check Engine Light',
    subtitle: 'Diagnose misfire code P0300',
    prompt: 'Explain what causes OBD fault code P0300 and how to fix it.',
    icon: 'engine-outline',
  },
  {
    id: 'repair',
    title: 'Maintenance Guide',
    subtitle: 'Brake pad replacement steps',
    prompt: 'Provide a simple step-by-step guide for replacing brake pads.',
    icon: 'wrench-outline',
  },
  {
    id: 'compare',
    title: 'Car Comparison',
    subtitle: 'Toyota Camry vs Honda Accord',
    prompt: 'Compare reliability, mileage, and features: Toyota Camry vs Honda Accord.',
    icon: 'car-shift-pattern',
  },
  {
    id: 'valuation',
    title: 'Used Car Checklist',
    subtitle: 'Buying advice under $10,000',
    prompt: 'What critical items should I inspect when buying a used car under $10,000?',
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
    toggleSidebar
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
    carouselRef.current?.scrollTo({ x: index * (SLIDE_WIDTH + 10), animated: true });
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SLIDE_WIDTH + 10));
    if (index !== activeTab && (index === 0 || index === 1)) {
      setActiveTab(index);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.innerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        
        {/* 1. CLEAN SIMPLE HEADER: "Chat with Car AI" */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.iconButton, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]} 
            onPress={toggleSidebar}
          >
            <Feather name="menu" size={19} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Clean Central Title */}
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Chat with Car AI</Text>

          {/* Theme Switcher Button */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.iconButton, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={themeMode === 'dark' ? 'sunny' : 'moon'} 
              size={17} 
              color={themeMode === 'dark' ? '#F59E0B' : '#6366F1'} 
            />
          </TouchableOpacity>
        </View>

        {/* Messages List & Empty State */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatList} 
          contentContainerStyle={styles.chatListContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentConvo.messages.length === 0 && !dualResponse && (
            <View style={styles.emptyContainer}>
              <View style={[styles.heroBadge, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Ionicons name="car-sport" size={32} color={colors.accent} />
              </View>

              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Car AI Assistant</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Ask any question about cars, diagnostic codes, repairs, or buying advice.
              </Text>

              {/* Starter Prompt Cards */}
              <View style={styles.promptGrid}>
                {STARTER_PROMPTS.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    activeOpacity={0.7}
                    style={[styles.promptCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                    onPress={() => handleSend(item.prompt)}
                  >
                    <View style={styles.promptCardHeader}>
                      <MaterialCommunityIcons name={item.icon} size={20} color={colors.accent} />
                      <Feather name="arrow-up-right" size={14} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.promptCardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.promptCardSub, { color: colors.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          )}

          {/* Messages */}
          {currentConvo.messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.role === 'user' 
                  ? [styles.userBubble, { backgroundColor: colors.userBubble }] 
                  : [styles.aiBubble, { backgroundColor: colors.aiBubble, borderColor: colors.cardBorder }]
              ]}
            >
              <View style={styles.bubbleHeader}>
                {msg.role === 'user' ? (
                  <View style={styles.roleBadge}>
                    <Feather name="user" size={12} color="#FFFFFF" />
                    <Text style={styles.userRoleText}>You</Text>
                  </View>
                ) : (
                  <View style={styles.roleBadge}>
                    <Ionicons name="car-sport" size={13} color={colors.accentCyan} />
                    <Text style={[styles.aiRoleText, { color: colors.accentCyan }]}>Car AI</Text>
                  </View>
                )}
              </View>

              {msg.role === 'user' ? (
                <Text style={styles.userMessageText}>{msg.content}</Text>
              ) : (
                <Markdown style={getMarkdownStyles(colors)}>
                  {msg.content}
                </Markdown>
              )}
            </View>
          ))}

          {/* Loading Skeleton */}
          {isTyping && !dualResponse?.response_a.content && (
            <ChatSkeletonLoader />
          )}

          {/* Dual AI Answers Pager Carousel (FIXED BOX CUT-OFF & STOP ICON) */}
          {dualResponse && (
            <View style={[styles.dualCardContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.dualHeaderRow}>
                <View style={styles.dualTitleGroup}>
                  <Text style={[styles.dualTitle, { color: colors.textPrimary }]}>Dual AI Answers</Text>
                  <Text style={[styles.dualSubtitle, { color: colors.textSecondary }]}>Swipe left or right to compare options</Text>
                </View>

                {/* 3. FIXED STOP BUTTON WITH CRISP VECTOR ICON */}
                {isTyping && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.stopBtn} onPress={stopGeneration}>
                    <Ionicons name="stop-circle" size={15} color="#FCA5A5" />
                    <Text style={styles.stopText}>Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Segmented Tab Buttons */}
              <View style={[styles.tabBar, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton, 
                    activeTab === 0 && [styles.activeTabButton, { backgroundColor: colors.cardBg, borderColor: colors.accent }]
                  ]}
                  onPress={() => handleTabPress(0)}
                >
                  <Ionicons name="flash-outline" size={14} color={activeTab === 0 ? colors.accent : colors.textMuted} />
                  <Text style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 0 && { color: colors.accent, fontWeight: '700' }]}>
                    Factual Mode
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton, 
                    activeTab === 1 && [styles.activeTabButton, { backgroundColor: colors.cardBg, borderColor: colors.accentCyan }]
                  ]}
                  onPress={() => handleTabPress(1)}
                >
                  <MaterialCommunityIcons name="sparkles-outline" size={14} color={activeTab === 1 ? colors.accentCyan : colors.textMuted} />
                  <Text style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 1 && { color: colors.accentCyan, fontWeight: '700' }]}>
                    Descriptive Mode
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. FIXED HORIZONTAL CAROUSEL (ZERO CUT-OFF) */}
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={SLIDE_WIDTH + 10}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.carouselContentContainer}
              >
                {/* Slide A */}
                <View style={[styles.slideCard, { width: SLIDE_WIDTH, backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option A — Factual Answer</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.badgeText }]}>Factual</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.slideScroll} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    <Markdown style={getMarkdownStyles(colors)}>
                      {dualResponse.response_a.content || (isTyping ? 'Generating factual response...' : 'No response generated.')}
                    </Markdown>
                  </ScrollView>

                  {dualResponse.streaming_complete && (
                    <TouchableOpacity 
                      activeOpacity={0.8} 
                      style={[styles.chooseBtn, { backgroundColor: colors.accent }]} 
                      onPress={() => chooseResponse('a')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.chooseBtnText}>Select Option A</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Slide B */}
                <View style={[styles.slideCard, { width: SLIDE_WIDTH, backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option B — Descriptive Advice</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.telemetryCyanBg, borderColor: colors.telemetryCyanBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.telemetryCyanText }]}>Descriptive</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.slideScroll} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    <Markdown style={getMarkdownStyles(colors)}>
                      {dualResponse.response_b.content || (isTyping ? 'Generating descriptive response...' : 'No response generated.')}
                    </Markdown>
                  </ScrollView>

                  {dualResponse.streaming_complete && (
                    <TouchableOpacity 
                      activeOpacity={0.8} 
                      style={[styles.chooseBtn, { backgroundColor: colors.accentCyan }]} 
                      onPress={() => chooseResponse('b')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.chooseBtnText}>Select Option B</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              {/* Page Dots */}
              <View style={styles.paginationDots}>
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 0 && [styles.activeDot, { backgroundColor: colors.accent }]]} />
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 1 && [styles.activeDot, { backgroundColor: colors.accentCyan }]]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* 4. EXACT INPUT PLACEHOLDER: "Ask about car specs" */}
        <View style={[styles.inputContainer, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
          <TextInput
            style={[
              styles.textInput, 
              { 
                backgroundColor: colors.inputBg, 
                borderColor: colors.inputBorder, 
                color: colors.inputText,
                height: Math.min(100, Math.max(44, inputHeight)) 
              }
            ]}
            placeholder="Ask about car specs"
            placeholderTextColor={colors.inputPlaceholder}
            value={input}
            onChangeText={setInput}
            onContentSizeChange={(e) => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
            multiline
          />
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.sendBtn, { backgroundColor: colors.accent }, (!input.trim() || isTyping) && styles.disabledSendBtn]} 
            onPress={() => handleSend()} 
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="send" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Drawers & Modals */}
        <SidebarDrawer />
        <AuthModal />

      </View>
    </KeyboardAvoidingView>
  );
}

const getMarkdownStyles = (colors) => ({
  body: {
    color: colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 20,
  },
  strong: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  em: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  heading1: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  code_inline: {
    backgroundColor: colors.subCardBg,
    color: colors.accentCyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  code_block: {
    backgroundColor: colors.subCardBg,
    borderColor: colors.subCardBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: colors.accentCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginVertical: 6,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  }
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: -0.2,
  },
  chatList: { 
    flex: 1, 
  },
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginBottom: 24,
  },
  promptGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  promptCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  promptCardSub: {
    fontSize: 11,
  },
  messageBubble: { 
    borderRadius: 18, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14, 
    maxWidth: '88%'
  },
  userBubble: { 
    alignSelf: 'flex-end' 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    borderWidth: 1 
  },
  bubbleHeader: {
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiRoleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  dualCardContainer: { 
    borderRadius: 18, 
    padding: 12, 
    marginVertical: 12, 
    borderWidth: 1,
    overflow: 'hidden',
  },
  dualHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  dualTitleGroup: {},
  dualTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
  },
  dualSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  stopBtn: { 
    backgroundColor: '#3B1717', 
    borderColor: '#991B1B',
    borderWidth: 1,
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stopText: { 
    color: '#FCA5A5', 
    fontSize: 11, 
    fontWeight: '700' 
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
  },
  activeTabButton: {
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  carouselContentContainer: {
    paddingRight: 10,
  },
  slideCard: { 
    borderRadius: 14, 
    padding: 12, 
    minHeight: 220, 
    borderWidth: 1,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slideTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
  },
  modeChip: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slideScroll: { 
    flex: 1, 
    maxHeight: 240 
  },
  chooseBtn: { 
    borderRadius: 12, 
    paddingVertical: 10, 
    marginTop: 10, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chooseBtnText: { 
    color: '#FFFFFF', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
  },
  inputContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderTopWidth: 1, 
    alignItems: 'center', 
    gap: 10 
  },
  textInput: { 
    flex: 1, 
    borderRadius: 22, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    fontSize: 14, 
    borderWidth: 1,
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledSendBtn: {
    opacity: 0.4,
  }
});
