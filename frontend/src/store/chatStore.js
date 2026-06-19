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

/* ── Mock AI responses (replaced in Day 5 with real API) ── */
const MOCK_RESPONSES = [
  "Great question! Based on your query, I'd recommend checking the manufacturer's specifications first. For most modern vehicles, you'll want to follow the service schedule outlined in your owner's manual.\n\n**Key points to consider:**\n- Mileage intervals (usually every 5,000–10,000 km)\n- Driving conditions (city vs highway)\n- Vehicle age and model year\n\nWould you like more specific advice for your car model?",
  "That's a common concern among car owners. Here's what you need to know:\n\n1. **Check the warning lights** — your dashboard will usually alert you first\n2. **Listen for unusual sounds** — grinding, squealing, or knocking\n3. **Feel for vibrations** — especially during braking or acceleration\n\nI'd recommend getting a professional inspection if you're unsure. Safety should always come first! 🚗",
  "Excellent choice to research before buying! Here's a quick breakdown:\n\n| Factor | Details |\n|--------|--------|\n| Fuel efficiency | 15–18 km/L (highway) |\n| Maintenance cost | Low to moderate |\n| Reliability | Above average |\n| Resale value | Strong |\n\nOverall, this is a solid option for most drivers. Do you have any specific concerns about budget or features?",
  "For your situation, here's my expert recommendation:\n\nThe **5W-30** grade is typically better for year-round use in most climates. It flows well in cold starts while maintaining viscosity at operating temperature.\n\n> **Pro tip:** Always check your car's dipstick after an oil change and again after the first few hundred kilometers.\n\nLet me know if you need help finding the right oil brand for your engine!",
];

let mockIndex = 0;
function getMockResponse() {
  const r = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
  mockIndex++;
  return r;
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
    const { activeConversationId, newConversation } = get();

    // Ensure there's an active conversation
    let convId = activeConversationId;
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

    // Simulate network delay (1.2 – 2.4s)
    const delay = 1200 + Math.random() * 1200;
    await new Promise((r) => setTimeout(r, delay));

    const aiMsg = createMessage("assistant", getMockResponse());

    // Add AI message + stop typing
    set((state) => ({
      isTyping: false,
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      ),
    }));
  },

  /** Toggle sidebar */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
}));
