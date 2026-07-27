import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
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

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleTheme } = useThemeStore();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 for A, 1 for B
  const [inputHeight, setInputHeight] = useState(44);
  const scrollViewRef = useRef(null);
  const carouselRef = useRef(null);

  // Pulse animation for header car emblem
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
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

  // Auto-scroll chat list to bottom when messages update or dual response streams
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentConvo.messages, dualResponse]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const text = input;
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.innerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.cardBorder }]}>
          <View style={styles.headerLeft}>
            {/* Sidebar Hamburger Button */}
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.hamburgerBtn} 
              onPress={toggleSidebar}
            >
              <Feather name="menu" size={22} color={colors.accent} />
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Animated.View style={[styles.carIconBadge, { backgroundColor: colors.badgeBg, transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="car-sport" size={18} color={colors.accent} />
              </Animated.View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Car Specialist AI</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Offline AI Assistant</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.offlineBadge, { backgroundColor: colors.offlineGreenBg, borderColor: colors.offlineGreenBorder }]}>
              <View style={[styles.greenDot, { backgroundColor: colors.offlineGreenText }]} />
              <Text style={[styles.badgeText, { color: colors.offlineGreenText }]}>OFFLINE ACTIVE</Text>
            </View>

            {/* Theme Toggle Button */}
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.themeBtn, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={themeMode === 'dark' ? 'sunny' : 'moon'} 
                size={16} 
                color={themeMode === 'dark' ? '#F59E0B' : '#6366F1'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatList} 
          contentContainerStyle={styles.chatListContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentConvo.messages.length === 0 && !dualResponse && (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Ionicons name="car-sport" size={32} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Car Specialist AI Ready</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ask about vehicle diagnostics, OBD fault codes, engine specs, repair steps, or buying recommendations.
              </Text>
            </View>
          )}

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
              <Text style={[styles.roleLabel, msg.role === 'user' ? styles.userRole : [styles.aiRole, { color: colors.accent }]]}>
                {msg.role === 'user' ? 'You' : 'Car Specialist AI'}
              </Text>

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

          {/* ChatGPT / Claude Style Horizontal Swipeable Dual Response Carousel */}
          {dualResponse && (
            <View style={[styles.dualCardContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.dualHeaderRow}>
                <View style={styles.dualTitleGroup}>
                  <Text style={[styles.dualTitle, { color: colors.textPrimary }]}>Dual AI Answers</Text>
                  <Text style={[styles.dualSubtitle, { color: colors.textSecondary }]}>Swipe left or right to compare options</Text>
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
                    activeTab === 0 && [styles.activeTabButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]
                  ]}
                  onPress={() => handleTabPress(0)}
                >
                  <Ionicons name="flash" size={13} color={activeTab === 0 ? colors.accent : colors.textMuted} />
                  <Text style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 0 && { color: colors.accent, fontWeight: '700' }]}>
                    Direct & Factual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton, 
                    activeTab === 1 && [styles.activeTabButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]
                  ]}
                  onPress={() => handleTabPress(1)}
                >
                  <Ionicons name="sparkles" size={13} color={activeTab === 1 ? colors.accent : colors.textMuted} />
                  <Text style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 1 && { color: colors.accent, fontWeight: '700' }]}>
                    Detailed & Creative
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Horizontal Swipeable Pager / Carousel */}
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
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option A — Direct & Precise</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.badgeText }]}>Factual Mode</Text>
                    </View>
                  </View>

                  <ScrollView 
                    style={styles.slideScroll} 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
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
                      <Text style={styles.chooseBtnText}>Use Option A</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Slide B */}
                <View style={[styles.slideCard, { width: CAROUSEL_WIDTH - 28, backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>Option B — Detailed & Creative</Text>
                    <View style={[styles.modeChip, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                      <Text style={[styles.modeChipText, { color: colors.badgeText }]}>Descriptive Mode</Text>
                    </View>
                  </View>

                  <ScrollView 
                    style={styles.slideScroll} 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    <Markdown style={getMarkdownStyles(colors)}>
                      {dualResponse.response_b.content || (isTyping ? 'Generating descriptive response...' : 'No response generated.')}
                    </Markdown>
                  </ScrollView>

                  {dualResponse.streaming_complete && (
                    <TouchableOpacity 
                      activeOpacity={0.8} 
                      style={[styles.chooseBtn, { backgroundColor: colors.accent }]} 
                      onPress={() => chooseResponse('b')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.chooseBtnText}>Use Option B</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              {/* Page Indicator Dots */}
              <View style={styles.paginationDots}>
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 0 && [styles.activeDot, { backgroundColor: colors.accent }]]} />
                <View style={[styles.dot, { backgroundColor: colors.cardBorder }, activeTab === 1 && [styles.activeDot, { backgroundColor: colors.accent }]]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar shiftable with Keyboard */}
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
            placeholder="Ask about cars..."
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
            onPress={handleSend} 
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Modals & Drawers */}
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
    color: colors.accent,
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
    color: colors.accent,
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
    gap: 12,
  },
  hamburgerBtn: {
    padding: 4,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offlineBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: { 
    fontSize: 9.5, 
    fontWeight: '700', 
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  messageBubble: { 
    borderRadius: 18, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14, 
    maxWidth: '85%'
  },
  userBubble: { 
    alignSelf: 'flex-end' 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    borderWidth: 1 
  },
  roleLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  aiRole: {},
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
  dualTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
  },
  dualSubtitle: {
    fontSize: 11,
  },
  stopBtn: { 
    backgroundColor: '#991B1B', 
    paddingHorizontal: 12, 
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
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
