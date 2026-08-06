import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
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
    toggleAuthModal,
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
        <Pressable style={styles.backdrop} onPress={closeSidebar} />

        <View style={[
          styles.drawer,
          {
            backgroundColor: colors.cardBg,
            borderRightColor: colors.cardBorder,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
          },
        ]}>

          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <Ionicons name="car-sport" size={20} color={colors.accent} />
              <Text style={[styles.brandName, { color: colors.textPrimary }]}>Car AI</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeSidebar}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* User profile row */}
          <View style={[styles.profileRow, { backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>
                {user ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                {user ? user.name : 'Guest'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user ? user.email : 'Offline mode'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}
              onPress={() => {
                if (user) { logoutUser(); } else { closeSidebar(); toggleAuthModal(); }
              }}
            >
              <Feather name={user ? 'log-out' : 'log-in'} size={14} color={colors.accent} />
              <Text style={[styles.actionBtnText, { color: colors.accent }]}>
                {user ? 'Sign Out' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: colors.subCardBg, borderColor: colors.cardBorder }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={themeMode === 'dark' ? 'sunny' : 'moon'}
                size={14}
                color={themeMode === 'dark' ? '#F59E0B' : '#6B7280'}
              />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                {themeMode === 'dark' ? 'Light' : 'Dark'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Chat */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.newChatBtn, { backgroundColor: colors.accent }]}
            onPress={startNewChat}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.newChatText}>Start New Chat</Text>
          </TouchableOpacity>

          {/* Section label */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>RECENT CHATS</Text>

          {/* Chat history */}
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {conversations.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No past chats yet.</Text>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <View
                    key={conv.id}
                    style={[
                      styles.historyRow,
                      { borderColor: isActive ? colors.accent : 'transparent', backgroundColor: isActive ? colors.badgeBg : 'transparent' },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.historyTitleArea}
                      onPress={() => selectConversation(conv.id)}
                    >
                      <Feather
                        name="message-square"
                        size={13}
                        color={isActive ? colors.accent : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.historyTitle,
                          { color: isActive ? colors.textPrimary : colors.textSecondary },
                          isActive && { fontWeight: '700' },
                        ]}
                        numberOfLines={1}
                      >
                        {conv.title || 'Untitled Chat'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => deleteConversation(conv.id)}
                    >
                      <Feather name="trash-2" size={13} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Car AI v2.0 · Offline</Text>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
  drawer: {
    width: '78%',
    maxWidth: 310,
    borderRightWidth: 1,
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
    marginHorizontal: 14,
    marginBottom: 20,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 14,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  historyTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    fontSize: 13,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
  },
});
