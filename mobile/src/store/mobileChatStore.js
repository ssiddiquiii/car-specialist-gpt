import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LlamaService, { MODEL_CONFIG, DOWNLOAD_STATES } from '../services/llamaService';

const CHATS_STORAGE_KEY = '@car_specialist_chats_v2';
const USER_STORAGE_KEY = '@car_specialist_user_v2';

export const useMobileChatStore = create((set, get) => ({
  // Model & Setup State
  isCheckingModel: true,
  isModelReady: false,
  isDownloading: false,
  downloadState: DOWNLOAD_STATES.NOT_STARTED,
  downloadError: null,
  downloadProgress: { progressPercent: 0, writtenMB: '0', totalMB: '0' },

  // Navigation & Drawer State
  isSidebarOpen: false,
  isAuthModalOpen: false,

  // Auth State
  user: null,

  // Chat State
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  dualResponse: null,

  // Initialize Store Data
  checkModelStatus: async () => {
    set({ isCheckingModel: true, downloadError: null });

    // Load saved User profile
    try {
      const savedUserJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUserJson) {
        set({ user: JSON.parse(savedUserJson) });
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }

    // Load saved Chat History
    try {
      const savedChatsJson = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
      if (savedChatsJson) {
        const savedConvos = JSON.parse(savedChatsJson);
        set({ conversations: savedConvos });
        if (savedConvos.length > 0) {
          set({ activeConversationId: savedConvos[0].id });
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }

    // Check offline GGUF model file status
    try {
      const isDownloaded = await LlamaService.isModelDownloaded();
      if (isDownloaded) {
        console.log("[MobileChatStore] Model file found. Initializing Llama Engine...");
        await LlamaService.initModel();
        set({ isModelReady: true, isCheckingModel: false });
      } else {
        console.log("[MobileChatStore] Model file missing or incomplete.");
        set({ isModelReady: false, isCheckingModel: false });
      }
    } catch (e) {
      console.error("[MobileChatStore] Check model status failed:", e);
      set({ 
        isModelReady: false, 
        isCheckingModel: false, 
        downloadError: e.message || "Failed to initialize AI engine. Please ensure device has enough RAM." 
      });
    }
  },

  // Save Conversations Helper
  saveConversationsToStorage: async (convos) => {
    try {
      await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(convos));
    } catch (e) {
      console.error("Failed to save conversations:", e);
    }
  },

  // Auth Actions
  loginUser: async (email, password, name = "Car Enthusiast") => {
    const userProfile = { name: name || email.split('@')[0], email };
    set({ user: userProfile, isAuthModalOpen: false });
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  },

  logoutUser: async () => {
    set({ user: null });
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear user session:", e);
    }
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleAuthModal: () => set((state) => ({ isAuthModalOpen: !state.isAuthModalOpen })),

  // Sidebar Chat Navigation Actions
  startNewChat: () => {
    const newId = `conv_${Date.now()}`;
    set({
      activeConversationId: newId,
      dualResponse: null,
      isSidebarOpen: false
    });
  },

  selectConversation: (id) => {
    set({
      activeConversationId: id,
      dualResponse: null,
      isSidebarOpen: false
    });
  },

  deleteConversation: (id) => {
    set((state) => {
      const updated = state.conversations.filter(c => c.id !== id);
      const nextActiveId = state.activeConversationId === id 
        ? (updated.length > 0 ? updated[0].id : null) 
        : state.activeConversationId;

      get().saveConversationsToStorage(updated);
      return {
        conversations: updated,
        activeConversationId: nextActiveId,
        dualResponse: state.activeConversationId === id ? null : state.dualResponse
      };
    });
  },

  // Model Download Action
  startModelDownload: async () => {
    set({ isDownloading: true, downloadError: null, downloadState: DOWNLOAD_STATES.DOWNLOADING });
    try {
      await LlamaService.downloadModel((progress) => {
        set({ downloadProgress: progress, downloadState: progress.state });
      });

      await LlamaService.initModel();
      set({ isDownloading: false, isModelReady: true, downloadState: DOWNLOAD_STATES.COMPLETED });
    } catch (e) {
      console.error("[MobileChatStore] Download or init failed:", e);
      set({ 
        isDownloading: false, 
        downloadState: DOWNLOAD_STATES.FAILED,
        downloadError: e.message || "Download failed. Please check internet connection and try again." 
      });
    }
  },

  // Dual Response Generation (Sequential A + B, User Selects Output)
  sendMessage: async (content) => {
    if (!content.trim()) return;

    let convId = get().activeConversationId;
    if (!convId) {
      convId = `conv_${Date.now()}`;
      set({ activeConversationId: convId });
    }

    const userMsg = { id: `user_${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() };

    set((state) => {
      const existingConvIndex = state.conversations.findIndex(c => c.id === convId);
      let updatedConvos = [...state.conversations];
      if (existingConvIndex >= 0) {
        updatedConvos[existingConvIndex] = {
          ...updatedConvos[existingConvIndex],
          messages: [...(updatedConvos[existingConvIndex].messages || []), userMsg]
        };
      } else {
        updatedConvos.unshift({ id: convId, title: content.slice(0, 32), messages: [userMsg] });
      }

      get().saveConversationsToStorage(updatedConvos);

      return {
        isTyping: true,
        conversations: updatedConvos,
        dualResponse: {
          prompt: content,
          response_a: { content: '', token_count: 0 },
          response_b: { content: '', token_count: 0 },
          streaming_complete: false,
        }
      };
    });

    try {
      let pendingA = "";
      let lastUpdateA = Date.now();

      // 1. Stream Option A (Temp 0.3 Factual)
      await LlamaService.generatePrimaryResponse(
        [userMsg],
        (tokenA) => {
          pendingA += tokenA;
          if (Date.now() - lastUpdateA > 60) {
            set((state) => ({
              dualResponse: state.dualResponse ? {
                ...state.dualResponse,
                response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA }
              } : null
            }));
            pendingA = "";
            lastUpdateA = Date.now();
          }
        }
      );

      // Flush remaining Option A tokens
      set((state) => ({
        dualResponse: state.dualResponse ? {
          ...state.dualResponse,
          response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA }
        } : null
      }));

      // 2. Stream Option B (Temp 0.6 Descriptive)
      let pendingB = "";
      let lastUpdateB = Date.now();

      await LlamaService.generateAlternateResponse(
        [userMsg],
        (tokenB) => {
          pendingB += tokenB;
          if (Date.now() - lastUpdateB > 60) {
            set((state) => ({
              dualResponse: state.dualResponse ? {
                ...state.dualResponse,
                response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB }
              } : null
            }));
            pendingB = "";
            lastUpdateB = Date.now();
          }
        }
      );

      // Flush remaining Option B tokens & mark streaming complete!
      set((state) => ({
        isTyping: false,
        dualResponse: state.dualResponse ? {
          ...state.dualResponse,
          response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB },
          streaming_complete: true
        } : null
      }));

    } catch (e) {
      console.error("[MobileChatStore] Local generation failed:", e);
      set((state) => ({
        isTyping: false,
        dualResponse: state.dualResponse ? { ...state.dualResponse, streaming_complete: true } : null
      }));
    }
  },

  stopGeneration: () => {
    LlamaService.stopGeneration();
    set((state) => ({
      isTyping: false,
      dualResponse: state.dualResponse ? { ...state.dualResponse, streaming_complete: true } : null
    }));
  },

  chooseResponse: (chosenKey) => {
    const { dualResponse, activeConversationId, conversations } = get();
    if (!dualResponse) return;

    const chosenContent = chosenKey === 'a' ? dualResponse.response_a.content : dualResponse.response_b.content;
    const aiMsg = { id: `ai_${Date.now()}`, role: 'assistant', content: chosenContent, timestamp: new Date().toISOString() };

    const updatedConvos = conversations.map((c) =>
      c.id === activeConversationId ? { ...c, messages: [...(c.messages || []), aiMsg] } : c
    );

    get().saveConversationsToStorage(updatedConvos);

    set({
      dualResponse: null,
      conversations: updatedConvos
    });
  }
}));
