import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Image, 
  Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMobileChatStore } from '../store/mobileChatStore';

export default function SidebarDrawer() {
  const insets = useSafeAreaInsets();
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
        <View style={[styles.drawer, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
          
          {/* Header & User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user ? user.name.charAt(0).toUpperCase() : '👤'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user ? user.name : 'Guest User'}</Text>
              <Text style={styles.userEmail}>{user ? user.email : 'Offline Access Mode'}</Text>
            </View>
          </View>

          {/* Auth Button (Login / Logout) */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.authBtn} 
            onPress={() => {
              if (user) {
                logoutUser();
              } else {
                closeSidebar();
                toggleAuthModal();
              }
            }}
          >
            <Text style={styles.authBtnText}>
              {user ? '🔒 Sign Out' : '🔑 Sign In / Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* New Chat Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.newChatBtn}
            onPress={startNewChat}
          >
            <Text style={styles.newChatPlus}>+</Text>
            <Text style={styles.newChatText}>Start New Chat</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Recent Conversations</Text>

          {/* Chat History List */}
          <ScrollView style={styles.chatsList} showsVerticalScrollIndicator={false}>
            {conversations.length === 0 ? (
              <Text style={styles.emptyChatsText}>No past conversations yet.</Text>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <View key={conv.id} style={[styles.chatItemRow, isActive && styles.activeChatItem]}>
                    <TouchableOpacity 
                      activeOpacity={0.7} 
                      style={styles.chatTitleArea}
                      onPress={() => selectConversation(conv.id)}
                    >
                      <Text style={styles.chatIcon}>💬</Text>
                      <Text 
                        style={[styles.chatTitleText, isActive && styles.activeChatTitleText]} 
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
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Car Specialist AI v2.0</Text>
            <Text style={styles.footerSub}>100% On-Device Engine</Text>
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
    backgroundColor: '#1C1C1A', // Claude warm dark charcoal
    borderRightWidth: 1,
    borderColor: '#383632',
    paddingHorizontal: 16,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141413',
    padding: 12,
    borderRadius: 14,
    borderColor: '#2E2C28',
    borderWidth: 1,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DA7756', // Terracotta accent
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
    color: '#ECECEC',
  },
  userEmail: {
    fontSize: 11,
    color: '#9F9D96',
  },
  authBtn: {
    backgroundColor: '#27272A',
    borderColor: '#383632',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    marginBottom: 12,
  },
  authBtnText: {
    color: '#DA7756',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#2E2C28',
    marginBottom: 14,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DA7756',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  newChatPlus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9F9D96',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chatsList: {
    flex: 1,
  },
  emptyChatsText: {
    fontSize: 12,
    color: '#71706B',
    textAlign: 'center',
    marginTop: 20,
  },
  chatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141413',
    borderColor: '#2E2C28',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  activeChatItem: {
    borderColor: '#DA7756',
    backgroundColor: 'rgba(218, 119, 86, 0.12)',
  },
  chatTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  chatIcon: {
    fontSize: 13,
  },
  chatTitleText: {
    fontSize: 13,
    color: '#D1CFCA',
    fontWeight: '500',
  },
  activeChatTitleText: {
    color: '#ECECEC',
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 13,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#2E2C28',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9F9D96',
  },
  footerSub: {
    fontSize: 10,
    color: '#71706B',
    marginTop: 2,
  }
});
