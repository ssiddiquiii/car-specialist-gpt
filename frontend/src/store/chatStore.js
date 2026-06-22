import { create } from "zustand";

let nextId = 1;
let msgId = 1;

function createConversation(title = "New Chat") {
  return {
    id: String(nextId++),
    title,
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

function createMessage(role, content) {
  return {
    id: String(msgId++),
    role,          // "user" | "assistant"
    content,
    timestamp: new Date().toISOString(),
  };
}

/* ── AI integration via FastAPI backend ── */

export const useChatStore = create((set, get) => ({
  // All conversations for the sidebar
  conversations: [
    { id: "1", title: "Best SUVs under $40k", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), messages: [] },
    { id: "2", title: "Toyota Camry vs Honda Accord", createdAt: new Date(Date.now() - 86400000).toISOString(), messages: [] },
    { id: "3", title: "Engine oil types explained", createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), messages: [] },
  ],

  // Currently active conversation id
  activeConversationId: null,

  // Whether the AI is currently "typing"
  isTyping: false,

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

  /**
   * Send a user message and trigger a mock AI response.
   * In Day 5 this will call the real FastAPI backend.
   */
  sendMessage: async (content) => {
    let convId = get().activeConversationId;

    // If no active convo, create one
    if (!convId) {
      convId = get().newConversation();
    }

    const userMsg = createMessage("user", content);

    // Add user message + start typing
    set((state) => ({
      isTyping: true,
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              // Auto-title: use first 40 chars of first message
              title: c.messages.length === 0
                ? content.slice(0, 42) + (content.length > 42 ? "…" : "")
                : c.title,
            }
          : c
      ),
    }));

    // Send request to FastAPI backend
    try {
      // Get the updated messages for this conversation
      const currentConvo = get().conversations.find((c) => c.id === convId);
      // We only send the role and content to the API
      const apiMessages = currentConvo.messages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMsg = createMessage("assistant", data.reply);

      // Add AI message + stop typing
      set((state) => ({
        isTyping: false,
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, aiMsg] }
            : c
        ),
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorMsg = createMessage("assistant", "⚠️ **Error:** Failed to connect to the backend server. Please make sure the FastAPI server is running.");
      set((state) => ({
        isTyping: false,
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errorMsg] }
            : c
        ),
      }));
    }
  },

  /** Toggle sidebar */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
}));
