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
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useMobileChatStore } from '../store/mobileChatStore';
import SidebarDrawer from './SidebarDrawer';
import AuthModal from './AuthModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 for A, 1 for B
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
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.innerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Sidebar Hamburger Button */}
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.hamburgerBtn} 
              onPress={toggleSidebar}
            >
              <Text style={styles.hamburgerIcon}>☰</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.headerIcon} 
              />
              <View>
                <Text style={styles.headerTitle}>Car Specialist AI</Text>
                <Text style={styles.headerSubtitle}>Offline AI Assistant</Text>
              </View>
            </View>
          </View>

          <View style={styles.offlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.badgeText}>OFFLINE ACTIVE</Text>
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
              <View style={styles.emptyIconBg}>
                <Text style={styles.emptyIcon}>🚗</Text>
              </View>
              <Text style={styles.emptyTitle}>Car Specialist AI Ready</Text>
              <Text style={styles.emptyText}>
                Ask about vehicle diagnostics, OBD fault codes, engine specs, repair steps, or buying recommendations.
              </Text>
            </View>
          )}

          {currentConvo.messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={[styles.roleLabel, msg.role === 'user' ? styles.userRole : styles.aiRole]}>
                {msg.role === 'user' ? 'You' : 'Car Specialist AI'}
              </Text>

              {msg.role === 'user' ? (
                <Text style={styles.userMessageText}>{msg.content}</Text>
              ) : (
                <Markdown style={markdownStyles}>
                  {msg.content}
                </Markdown>
              )}
            </View>
          ))}

          {/* ChatGPT / Claude Style Horizontal Swipeable Dual Response Carousel */}
          {dualResponse && (
            <View style={styles.dualCardContainer}>
              <View style={styles.dualHeaderRow}>
                <View style={styles.dualTitleGroup}>
                  <Text style={styles.dualTitle}>Dual AI Answers</Text>
                  <Text style={styles.dualSubtitle}>Swipe left or right to compare options</Text>
                </View>
                {isTyping && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.stopBtn} onPress={stopGeneration}>
                    <Text style={styles.stopText}>⏹ Stop</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Segmented Tab Buttons */}
              <View style={styles.tabBar}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.tabButton, activeTab === 0 && styles.activeTabButton]}
                  onPress={() => handleTabPress(0)}
                >
                  <Text style={[styles.tabButtonText, activeTab === 0 && styles.activeTabText]}>
                    ⚡ Direct & Factual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
                  onPress={() => handleTabPress(1)}
                >
                  <Text style={[styles.tabButtonText, activeTab === 1 && styles.activeTabText]}>
                    💡 Detailed & Creative
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
                <View style={[styles.slideCard, { width: CAROUSEL_WIDTH - 28 }]}>
                  <View style={styles.slideHeader}>
                    <Text style={styles.slideTitle}>Option A — Direct & Precise</Text>
                    <View style={styles.modeChip}>
                      <Text style={styles.modeChipText}>Factual Mode</Text>
                    </View>
                  </View>

                  <ScrollView 
                    style={styles.slideScroll} 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    <Markdown style={markdownStyles}>
                      {dualResponse.response_a.content || (isTyping ? 'Generating factual response...' : 'No response generated.')}
                    </Markdown>
                  </ScrollView>

                  {dualResponse.streaming_complete && (
                    <TouchableOpacity activeOpacity={0.8} style={styles.chooseBtn} onPress={() => chooseResponse('a')}>
                      <Text style={styles.chooseBtnText}>✓ Use Option A</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Slide B */}
                <View style={[styles.slideCard, { width: CAROUSEL_WIDTH - 28 }]}>
                  <View style={styles.slideHeader}>
                    <Text style={styles.slideTitle}>Option B — Detailed & Creative</Text>
                    <View style={styles.modeChip}>
                      <Text style={styles.modeChipText}>Descriptive Mode</Text>
                    </View>
                  </View>

                  <ScrollView 
                    style={styles.slideScroll} 
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    <Markdown style={markdownStyles}>
                      {dualResponse.response_b.content || (isTyping ? 'Generating descriptive response...' : 'No response generated.')}
                    </Markdown>
                  </ScrollView>

                  {dualResponse.streaming_complete && (
                    <TouchableOpacity activeOpacity={0.8} style={styles.chooseBtn} onPress={() => chooseResponse('b')}>
                      <Text style={styles.chooseBtnText}>✓ Use Option B</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              {/* Page Indicator Dots */}
              <View style={styles.paginationDots}>
                <View style={[styles.dot, activeTab === 0 && styles.activeDot]} />
                <View style={[styles.dot, activeTab === 1 && styles.activeDot]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar shiftable with Keyboard */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, { height: Math.min(100, Math.max(44, inputHeight)) }]}
            placeholder="Ask about cars..."
            placeholderTextColor="#71706B"
            value={input}
            onChangeText={setInput}
            onContentSizeChange={(e) => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
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

        {/* Modals & Drawers */}
        <SidebarDrawer />
        <AuthModal />

      </View>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = {
  body: {
    color: '#ECECEC',
    fontSize: 13.5,
    lineHeight: 20,
  },
  strong: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  em: {
    fontStyle: 'italic',
    color: '#D1CFCA',
  },
  heading1: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DA7756',
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ECECEC',
    marginTop: 6,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ECECEC',
    marginTop: 4,
    marginBottom: 2,
  },
  code_inline: {
    backgroundColor: '#27272A',
    color: '#DA7756',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  code_block: {
    backgroundColor: '#141413',
    borderColor: '#383632',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#DA7756',
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
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141413' // Claude warm charcoal
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C1C1A',
    borderBottomWidth: 1,
    borderColor: '#2E2C28',
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
  hamburgerIcon: {
    fontSize: 22,
    color: '#DA7756',
    fontWeight: '700',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#ECECEC',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9F9D96',
  },
  offlineBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8, 
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
    fontSize: 9.5, 
    fontWeight: '700', 
    color: '#10B981' 
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
    backgroundColor: '#1F1E1B',
    borderColor: '#383632',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ECECEC',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#9F9D96',
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
    backgroundColor: '#DA7756', // Claude terracotta accent
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
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  dualCardContainer: { 
    backgroundColor: '#1C1C1A', 
    borderRadius: 20, 
    padding: 14, 
    marginVertical: 14, 
    borderColor: '#383632', 
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
    color: '#ECECEC' 
  },
  dualSubtitle: {
    fontSize: 11,
    color: '#9F9D96',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#141413',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    borderColor: '#2E2C28',
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#27272A',
    borderColor: '#383632',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#9F9D96',
  },
  activeTabText: {
    color: '#DA7756',
    fontWeight: '700',
  },
  carouselScrollView: {
    width: '100%',
  },
  slideCard: { 
    backgroundColor: '#141413', 
    borderRadius: 14, 
    padding: 14, 
    minHeight: 220, 
    borderColor: '#2E2C28',
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
    color: '#ECECEC' 
  },
  modeChip: {
    backgroundColor: 'rgba(218, 119, 86, 0.15)',
    borderColor: 'rgba(218, 119, 86, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DA7756',
  },
  slideScroll: { 
    flex: 1, 
    maxHeight: 240 
  },
  chooseBtn: { 
    backgroundColor: '#DA7756', 
    borderRadius: 12, 
    paddingVertical: 11, 
    marginTop: 12, 
    alignItems: 'center',
    shadowColor: '#DA7756',
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
    backgroundColor: '#383632',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#DA7756',
  },
  inputContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
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
