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
import { SPACING, TYPE, RADIUS } from '../theme';

export default function SidebarDrawer() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleTheme } = useThemeStore();
  const {
    isSidebarOpen, closeSidebar,
    conversations, activeConversationId,
    selectConversation, startNewChat, deleteConversation,
    user, logoutUser, toggleAuthModal,
  } = useMobileChatStore();

  if (!isSidebarOpen) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeSidebar}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />

        <View style={[
          styles.drawer,
          { backgroundColor: colors.bg, borderRightColor: colors.border, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}>

          {/* Brand row */}
          <View style={styles.brand}>
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>Car AI</Text>
            <TouchableOpacity activeOpacity={0.6} onPress={closeSidebar}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* User row */}
          <View style={[styles.userRow, { borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>{user ? user.name[0].toUpperCase() : '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name ?? 'Guest'}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email ?? 'Offline mode'}</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={() => { if (user) logoutUser(); else { closeSidebar(); toggleAuthModal(); } }}
            >
              <Feather name={user ? 'log-out' : 'log-in'} size={13} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>{user ? 'Sign out' : 'Sign in'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={13} color={colors.textSub} />
              <Text style={[styles.actionText, { color: colors.textSub }]}>{themeMode === 'dark' ? 'Light' : 'Dark'}</Text>
            </TouchableOpacity>
          </View>

          {/* New chat */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.newChat, { backgroundColor: colors.accent }]}
            onPress={startNewChat}
          >
            <Feather name="plus" size={15} color="#FFF" />
            <Text style={styles.newChatText}>New chat</Text>
          </TouchableOpacity>

          {/* Section label */}
          <Text style={[styles.section, { color: colors.textMuted }]}>RECENT</Text>

          {/* History */}
          <ScrollView style={styles.history} showsVerticalScrollIndicator={false}>
            {conversations.length === 0 ? (
              <Text style={[styles.emptyHist, { color: colors.textMuted }]}>No conversations yet.</Text>
            ) : (
              conversations.map(conv => {
                const active = conv.id === activeConversationId;
                return (
                  <View key={conv.id} style={[styles.histRow, active && { backgroundColor: colors.accentSoft }]}>
                    <TouchableOpacity style={styles.histMain} onPress={() => selectConversation(conv.id)} activeOpacity={0.7}>
                      <Text style={[styles.histTitle, { color: active ? colors.accent : colors.textSub }]} numberOfLines={1}>
                        {conv.title || 'Untitled'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => deleteConversation(conv.id)}>
                      <Feather name="trash-2" size={12} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.textMuted, borderTopColor: colors.border }]}>Car AI · v2.0</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)' },
  drawer: { width: '76%', maxWidth: 300, borderRightWidth: 1, flex: 1 },

  brand:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  brandName: { ...TYPE.heading },

  userRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderBottomWidth: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, marginBottom: SPACING.md },
  avatar:    { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ color: '#FFF', ...TYPE.small, fontWeight: '700' },
  userName:  { ...TYPE.small, fontWeight: '600' },
  userEmail: { ...TYPE.label, marginTop: 2 },

  actions: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderRadius: RADIUS.sm, paddingVertical: 8 },
  actionText:{ ...TYPE.small, fontWeight: '600' },

  newChat:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.pill, paddingVertical: 12, marginHorizontal: SPACING.md, marginBottom: SPACING.lg },
  newChatText: { color: '#FFF', ...TYPE.small, fontWeight: '700' },

  section:  { ...TYPE.label, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  history:  { flex: 1, paddingHorizontal: SPACING.md },
  emptyHist:{ ...TYPE.small, textAlign: 'center', marginTop: SPACING.lg },

  histRow:  { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 9, marginBottom: 3 },
  histMain: { flex: 1 },
  histTitle:{ ...TYPE.small },

  footer: { ...TYPE.label, paddingTop: SPACING.md, paddingHorizontal: SPACING.md, borderTopWidth: 1, marginTop: SPACING.sm },
});
