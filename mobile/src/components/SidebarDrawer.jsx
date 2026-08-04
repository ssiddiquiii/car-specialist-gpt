import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMobileChatStore } from '../store/mobileChatStore';
import { useThemeStore } from '../store/themeStore';

export default function SidebarDrawer() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleTheme } = useThemeStore();
  const { 
    isSidebarOpen, 
    closeSidebar, 
    conversations, 
    activeConversationId, 
    selectConversation, 
    startNewChat, 
    deleteConversation,
    user,
    logoutUser,
    toggleAuthModal
  } = useMobileChatStore();

  if (!isSidebarOpen) return null;

  return (
    <Modal
      visible={isSidebarOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={closeSidebar}
    >
      <View style={styles.overlay}>
        {/* Click outside to close */}
        <Pressable style={styles.backdrop} onPress={closeSidebar} />

        {/* Slide Drawer Content */}
        <View style={[styles.drawer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          
          {/* Header & User Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>
                {user ? user.name.charAt(0).toUpperCase() : <Feather name="user" size={18} color="#FFFFFF" />}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user ? user.name : 'Guest User'}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user ? user.email : 'Offline Access Mode'}</Text>
            </View>
          </View>

          {/* Action Row: Theme Toggle & Auth */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.authBtn, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]} 
              onPress={() => {
                if (user) {
                  logoutUser();
                } else {
                  closeSidebar();
                  toggleAuthModal();
                }
              }}
            >
              <Feather name={user ? "log-out" : "log-in"} size={14} color={colors.accent} />
              <Text style={[styles.authBtnText, { color: colors.accent }]}>
                {user ? 'Sign Out' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.themeToggleBtn, { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder }]}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={themeMode === 'dark' ? 'sunny' : 'moon'} 
                size={16} 
                color={themeMode === 'dark' ? '#F59E0B' : '#6366F1'} 
              />
              <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>
                {themeMode === 'dark' ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          {/* New Chat Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.newChatBtn, { backgroundColor: colors.accent }]}
            onPress={startNewChat}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.newChatText}>Start New Chat</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Recent Conversations</Text>

          {/* Chat History List */}
          <ScrollView style={styles.chatsList} showsVerticalScrollIndicator={false}>
            {conversations.length === 0 ? (
              <Text style={[styles.emptyChatsText, { color: colors.textMuted }]}>No past conversations yet.</Text>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <View 
                    key={conv.id} 
                    style={[
                      styles.chatItemRow, 
                      { backgroundColor: colors.subCardBg, borderColor: colors.subCardBorder },
                      isActive && { borderColor: colors.accent, backgroundColor: colors.badgeBg }
                    ]}
                  >
                    <TouchableOpacity 
                      activeOpacity={0.7} 
                      style={styles.chatTitleArea}
                      onPress={() => selectConversation(conv.id)}
                    >
                      <Feather name="message-square" size={14} color={isActive ? colors.accent : colors.textSecondary} />
                      <Text 
                        style={[styles.chatTitleText, { color: colors.textSecondary }, isActive && { color: colors.textPrimary, fontWeight: '700' }]} 
                        numberOfLines={1}
                      >
                        {conv.title || 'Untitled Chat'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.6}
                      style={styles.deleteBtn}
                      onPress={() => deleteConversation(conv.id)}
                    >
                      <Feather name="trash-2" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer Info */}
          <View style={[styles.footer, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Car AI v2.0</Text>
            <Text style={[styles.footerSub, { color: colors.textMuted }]}>100% Offline Mode</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawer: {
    width: '80%',
    maxWidth: 320,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  authBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  authBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeToggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chatsList: {
    flex: 1,
  },
  emptyChatsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  chatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  chatTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  chatTitleText: {
    fontSize: 13,
  },
  deleteBtn: {
    padding: 4,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 10,
    marginTop: 2,
  }
});
