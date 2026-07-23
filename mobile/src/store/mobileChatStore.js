import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LlamaService, { MODEL_CONFIG } from '../services/llamaService';

export const useMobileChatStore = create((set, get) => ({
  // Model & Setup State
  isCheckingModel: true,
  isModelReady: false,
  isDownloading: false,
  downloadError: null,
  downloadProgress: { progressPercent: 0, writtenMB: '0', totalMB: '0' },

  // Chat State
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  dualResponse: null,

  // Actions
  checkModelStatus: async () => {
    set({ isCheckingModel: true, downloadError: null });
    try {
      const isDownloaded = await LlamaService.isModelDownloaded();
      if (isDownloaded) {
        console.log("[MobileChatStore] Model file found on disk. Initializing Llama Engine...");
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
        downloadError: e.message || "Failed to initialize Gemma 2B engine. Please ensure device has enough RAM." 
      });
    }
  },

  startModelDownload: async () => {
    set({ isDownloading: true, downloadError: null });
    try {
      console.log("[MobileChatStore] Starting download for Gemma 2B model...");
      await LlamaService.downloadModel((progress) => {
        set({ downloadProgress: progress });
      });

      console.log("[MobileChatStore] Download finished. Initializing model context...");
      await LlamaService.initModel();
      set({ isDownloading: false, isModelReady: true });
    } catch (e) {
      console.error("[MobileChatStore] Download or init failed:", e);
      set({ 
        isDownloading: false, 
        downloadError: e.message || "Download or model initialization failed. Please check internet connection and try again." 
      });
    }
  },

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
        updatedConvos.push({ id: convId, title: content.slice(0, 30), messages: [userMsg] });
      }

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
      let pendingB = "";
      let lastUpdate = Date.now();

      await LlamaService.generateDualResponse(
        [userMsg],
        (tokenA) => {
          pendingA += tokenA;
          if (Date.now() - lastUpdate > 60) {
            set((state) => ({
              dualResponse: state.dualResponse ? {
                ...state.dualResponse,
                response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA }
              } : null
            }));
            pendingA = "";
            lastUpdate = Date.now();
          }
        },
        (tokenB) => {
          pendingB += tokenB;
          if (Date.now() - lastUpdate > 60) {
            set((state) => ({
              dualResponse: state.dualResponse ? {
                ...state.dualResponse,
                response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB }
              } : null
            }));
            pendingB = "";
            lastUpdate = Date.now();
          }
        }
      );

      set((state) => ({
        isTyping: false,
        dualResponse: state.dualResponse ? {
          ...state.dualResponse,
          response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA },
          response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB },
          streaming_complete: true
        } : null
      }));
    } catch (e) {
      console.error("[MobileChatStore] Local generation failed:", e);
      set({ isTyping: false });
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
    const { dualResponse, activeConversationId } = get();
    if (!dualResponse) return;

    const chosenContent = chosenKey === 'a' ? dualResponse.response_a.content : dualResponse.response_b.content;
    const aiMsg = { id: `ai_${Date.now()}`, role: 'assistant', content: chosenContent, timestamp: new Date().toISOString() };

    set((state) => ({
      dualResponse: null,
      conversations: state.conversations.map((c) =>
        c.id === activeConversationId ? { ...c, messages: [...(c.messages || []), aiMsg] } : c
      )
    }));
  }
}));
