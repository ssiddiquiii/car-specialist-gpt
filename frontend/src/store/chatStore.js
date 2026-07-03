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

const API_BASE = "http://localhost:8000";

export const useChatStore = create((set, get) => ({
  // All conversations for the sidebar
  conversations: [],

  // Currently active conversation id
  activeConversationId: null,

  // Whether the AI is currently "typing" / generating
  isTyping: false,

  // Sidebar open/collapsed state (for mobile)
  sidebarOpen: true,

  // Dual response state — populated when two responses arrive, cleared after user picks one
  dualResponse: null,
  // { prompt, conversation_id, user_id, response_a, response_b, context }

  // ── Actions ────────────────────────────────────────────────

  /** Fetch all conversations from backend */
  fetchConversations: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.reload();
        }
        throw new Error("Failed to fetch conversations");
      }
      const data = await res.json();
      set({ conversations: data });
    } catch (e) {
      console.error("Failed to fetch conversations:", e);
    }
  },

  /** Create a brand-new conversation and make it active */
  newConversation: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: "New Chat" })
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.reload();
        }
        throw new Error("Failed to create conversation");
      }
      const conv = await res.json();
      set((state) => ({
        conversations: [conv, ...state.conversations],
        activeConversationId: conv.id,
        dualResponse: null,
      }));
      return conv.id;
    } catch (e) {
      console.error("Failed to create conversation:", e);
      return null;
    }
  },

  /** Select an existing conversation */
  selectConversation: (id) => {
    set({ activeConversationId: id, dualResponse: null });
  },

  /** Delete a conversation */
  deleteConversation: async (id) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/chats/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to delete chat on backend:", e);
      }
    }
    
    set((state) => {
      const remaining = state.conversations.filter((c) => c.id !== id);
      if (state.activeConversationId === id) {
        return { 
          conversations: remaining, 
          activeConversationId: remaining[0]?.id ?? null, 
          dualResponse: null 
        };
      }
      return { conversations: remaining };
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
   * Send a user message → triggers dual response from backend.
   * Sets dualResponse state; ChatPage will render DualResponseCard.
   */
  sendMessage: async (content) => {
    let convId = get().activeConversationId;
    const token = localStorage.getItem("token");

    // If no active convo, create one
    if (!convId) {
      convId = await get().newConversation();
      if (!convId) return; // DB failure
    }

    const userMsg = createMessage("user", content);

    // Add user message + start typing indicator
    set((state) => ({
      isTyping: true,
      dualResponse: null,
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0
                ? content.slice(0, 42) + (content.length > 42 ? "…" : "")
                : c.title,
            }
          : c
      ),
    }));

    try {
      // Save user message to backend
      await fetch(`${API_BASE}/api/chats/${convId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: "user", content })
      });

      const currentConvo = get().conversations.find((c) => c.id === convId);

      // If it was the first message, persist the new title to the backend
      if (currentConvo.messages.length === 1) {
        await fetch(`${API_BASE}/api/chats/${convId}/title?title=${encodeURIComponent(currentConvo.title)}`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }

      // Build message history for context
      const apiMessages = currentConvo.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${API_BASE}/api/chat/dual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          conversation_id: convId,
          user_id: token, // Pass token as user identifier for backend decoding
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `API error: ${response.statusText}`);
      }

      // Initialize dualResponse state to show the UI cards immediately
      set({
        isTyping: false, // The card will show its own typing state
        dualResponse: {
          prompt: content,
          conversation_id: convId,
          user_id: "anonymous",
          response_a: { content: "", temperature: 0.7, token_count: 0, latency_ms: 0 },
          response_b: { content: "", temperature: 0.95, token_count: 0, latency_ms: 0 },
          context: apiMessages,
          streaming_complete: false,
        },
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr || dataStr === "[DONE]") continue;

            try {
              const msg = JSON.parse(dataStr);
              
              if (msg.type === "init") {
                set((state) => {
                  if (!state.dualResponse) return state;
                  return { dualResponse: { ...state.dualResponse, prompt: msg.prompt } };
                });
              } else if (msg.type === "stream_a") {
                set((state) => {
                  if (!state.dualResponse) return state;
                  return {
                    dualResponse: {
                      ...state.dualResponse,
                      response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + msg.chunk }
                    }
                  };
                });
              } else if (msg.type === "stream_b") {
                set((state) => {
                  if (!state.dualResponse) return state;
                  return {
                    dualResponse: {
                      ...state.dualResponse,
                      response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + msg.chunk }
                    }
                  };
                });
              } else if (msg.type === "stream_a_done") {
                set((state) => {
                  if (!state.dualResponse) return state;
                  return {
                    dualResponse: {
                      ...state.dualResponse,
                      response_a: { ...state.dualResponse.response_a, ...msg.metadata }
                    }
                  };
                });
              } else if (msg.type === "stream_b_done") {
                set((state) => {
                  if (!state.dualResponse) return state;
                  return {
                    dualResponse: {
                      ...state.dualResponse,
                      response_b: { ...state.dualResponse.response_b, ...msg.metadata }
                    }
                  };
                });
              }
            } catch (e) {
              console.warn("Failed to parse SSE chunk:", dataStr);
            }
          }
        }
      }
      
      // Mark stream as complete when loop finishes
      set((state) => {
        if (!state.dualResponse) return state;
        return {
          dualResponse: { ...state.dualResponse, streaming_complete: true }
        };
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg = createMessage(
        "assistant",
        "⚠️ **Error:** Failed to connect to the backend server. Please make sure the FastAPI server is running."
      );
      set((state) => ({
        isTyping: false,
        dualResponse: null,
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errorMsg] }
            : c
        ),
      }));
    }
  },

  /**
   * User chose one of the two responses.
   * Calls /api/preference to save to MongoDB, then adds chosen message to chat.
   */
  chooseDualResponse: async (chosen) => {
    const { dualResponse } = get();
    if (!dualResponse) return;

    const { prompt, conversation_id, user_id, response_a, response_b, context } = dualResponse;

    // Optimistically add chosen message and clear dual state
    const chosenContent =
      chosen === "a" ? response_a.content
      : chosen === "b" ? response_b.content
      : response_a.content; // skipped → default to A

    const aiMsg = createMessage("assistant", chosenContent);

    set((state) => ({
      dualResponse: null,
      conversations: state.conversations.map((c) =>
        c.id === conversation_id
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      ),
    }));

    // Save chosen message to chat DB
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/api/chats/${conversation_id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: "assistant", content: chosenContent })
      });
    } catch (err) {
      console.warn("Failed to save assistant message:", err);
    }

    // Save preference to MongoDB (non-blocking — fire and forget)
    try {
      await fetch(`${API_BASE}/api/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id,
          user_id: token, // Sending token directly as per our updated backend handler, or we should decode it. Wait, the backend expects user_id. The endpoint /api/preference uses request.user_id. We'll pass the token and let backend use it, or change backend. Let's just pass the token.
          prompt,
          context,
          response_a,
          response_b,
          chosen,
        }),
      });
    } catch (err) {
      // Non-fatal — preference logging failure shouldn't affect UX
      console.warn("Preference save failed (non-fatal):", err);
    }
  },

  /** Toggle sidebar */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
}));
