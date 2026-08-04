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
  Animated
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
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

const STARTER_PROMPTS = [
  {
    id: 'obd',
    title: 'OBD-II Fault Check',
    subtitle: 'Diagnose P0300 misfire code',
    prompt: 'Explain diagnostic steps for OBD-II fault code P0300 (random cylinder misfire).',
    icon: 'engine-outline',
  },
  {
    id: 'repair',
    title: 'Maintenance Guide',
    subtitle: 'Brake pad replacement steps',
    prompt: 'Provide a step-by-step DIY guide for replacing front brake pads and rotors safely.',
    icon: 'wrench-outline',
  },
  {
    id: 'compare',
    title: 'Spec Comparison',
    subtitle: 'Camry 2.5 vs Accord 1.5T',
    prompt: 'Compare reliability, engine specs, and fuel economy: 2024 Toyota Camry 2.5 vs Honda Accord 1.5T.',
    icon: 'car-shift-pattern',
  },
  {
    id: 'valuation',
    title: 'Buying Inspection',
    subtitle: 'Used SUV under $10,000',
    prompt: 'What critical items should I inspect when buying a used SUV under $10,000?',
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

  // Subtle pulse animation for header emblem
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

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
    carouselRef.current?.scrollTo({ x: index * CAROUSEL_WIDTH, animated: true });
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CAROUSEL_WIDTH);
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
        
        {/* Sleek Plot-Style Telemetry Header */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.iconButton, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]} 
              onPress={toggleSidebar}
            >
              <Feather name="menu" size={19} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Animated.View style={[styles.brandBadge, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder, transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="car-sport" size={16} color={colors.accent} />
              </Animated.View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Car Specialist</Text>
                  <View style={[styles.gptChip, { backgroundColor: colors.telemetryCyanBg, borderColor: colors.telemetryCyanBorder }]}>
                    <Text style={[styles.gptChipText, { color: colors.telemetryCyanText }]}>GPT</Text>
                  </View>
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>On-Device C++ Engine</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.telemetryPill, { backgroundColor: colors.offlineGreenBg, borderColor: colors.offlineGreenBorder }]}>
              <View style={[styles.greenPulseDot, { backgroundColor: colors.offlineGreenText }]} />
              <Text style={[styles.telemetryPillText, { color: colors.offlineGreenText }]}>OFFLINE ACTIVE</Text>
            </View>

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
              
              {/* Automotive Hero Branding */}
              <View style={[styles.heroBadge, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Ionicons name="car-sport" size={32} color={colors.accent} />
                <MaterialCommunityIcons name="sparkles" size={18} color={colors.accentCyan} style={styles.heroSparkle} />
              </View>

              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Car Specialist GPT</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                On-device automotive intelligence. Ask about engine diagnostics, OBD codes, maintenance, or vehicle comparisons.
              </Text>

              {/* Starter Telemetry Prompt Cards */}
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
                    <Text style={[styles.aiRoleText, { color: colors.accentCyan }]}>Car Specialist GPT</Text>
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

          {/* Dual Response Streaming & Skeleton Placeholder */}
          {isTyping && !dualResponse?.response_a.content && (
            <ChatSkeletonLoader />
          )}

          {/* Dual Response Horizontal Swipeable Carousel */}
          {dualResponse && (
            <View style={[styles.dualCardContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.dualHeaderRow}>
                <View style={styles.dualTitleGroup}>
                  <View style={styles.dualTitleRow}>
                    <MaterialCommunityIcons name="speedometer" size={16} color={colors.accent} />
                    <Text style={[styles.dualTitle, { color: colors.textPrimary }]}>Dual Engine Responses</Text>
                  </View>
                  <Text style={[styles.dualSubtitle, { color: colors.textSecondary }]}>Swipe left or right to compare outputs</Text>
                </View>
                {isTyping && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.stopBtn} onPress={stopGeneration}>
                    <Feather name="square" size={12} color="#FCA5A5" />
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
                    Direct & Factual
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
                    Detailed & Creative
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Horizontal Swipeable Pager Carousel */}
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.carouselScrollView}
              >
                {/* Slide A */}
                <View style={[styles.slideCard, { width: CAROUSEL_WIDTH - 28, backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option A — Precise Factual</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.badgeText }]}>Temp 0.3</Text>
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
                <View style={[styles.slideCard, { width: CAROUSEL_WIDTH - 28, backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option B — Detailed Advice</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.telemetryCyanBg, borderColor: colors.telemetryCyanBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.telemetryCyanText }]}>Temp 0.6</Text>
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

              {/* Page Indicator Dots */}
              <View style={styles.paginationDots}>
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 0 && [styles.activeDot, { backgroundColor: colors.accent }]]} />
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 1 && [styles.activeDot, { backgroundColor: colors.accentCyan }]]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Ergonomic Floating Input Composer */}
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
            placeholder="Ask about cars, OBD codes, or maintenance..."
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 14,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: -0.3,
  },
  gptChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  gptChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  telemetryPill: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  telemetryPillText: { 
    fontSize: 9, 
    fontWeight: '700', 
    letterSpacing: 0.3,
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
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  heroSparkle: {
    position: 'absolute',
    top: 6,
    right: 6,
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
    borderRadius: 20, 
    padding: 14, 
    marginVertical: 14, 
    borderWidth: 1 
  },
  dualHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  dualTitleGroup: {},
  dualTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
    gap: 4,
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
    marginBottom: 12,
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
  carouselScrollView: {
    width: '100%',
  },
  slideCard: { 
    borderRadius: 14, 
    padding: 14, 
    minHeight: 220, 
    borderWidth: 1,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    paddingVertical: 11, 
    marginTop: 12, 
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
    marginTop: 12,
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
