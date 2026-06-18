import { create } from "zustand";

let nextId = 1;

function createConversation(title = "New Chat") {
  return {
    id: String(nextId++),
    title,
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

export const useChatStore = create((set, get) => ({
  // All conversations for the sidebar
  conversations: [
    { id: "1", title: "Best SUVs under $40k", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), messages: [] },
    { id: "2", title: "Toyota Camry vs Honda Accord", createdAt: new Date(Date.now() - 86400000).toISOString(), messages: [] },
    { id: "3", title: "Engine oil types explained", createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), messages: [] },
  ],

  // Currently active conversation id
  activeConversationId: null,

  // Sidebar open/collapsed state (for mobile)
  sidebarOpen: true,

  // ── Actions ────────────────────────────────────────────────

  /** Create a brand-new conversation and make it active */
  newConversation: () => {
    const conv = createConversation("New Chat");
    set((state) => ({
      conversations: [conv, ...state.conversations],
      activeConversationId: conv.id,
    }));
    return conv.id;
  },

  /** Select an existing conversation */
  selectConversation: (id) => {
    set({ activeConversationId: id });
  },

  /** Delete a conversation */
  deleteConversation: (id) => {
    set((state) => {
      const remaining = state.conversations.filter((c) => c.id !== id);
      const newActive =
        state.activeConversationId === id
          ? remaining[0]?.id ?? null
          : state.activeConversationId;
      return { conversations: remaining, activeConversationId: newActive };
    });
  },

  /** Rename a conversation */
  renameConversation: (id, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  /** Get the active conversation object */
  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  },

  /** Toggle sidebar */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
}));
