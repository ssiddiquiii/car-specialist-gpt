import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LlamaService, { MODEL_CONFIGS } from '../services/llamaService';

export const useMobileChatStore = create((set, get) => ({
  // Model Setup State
  isModelReady: false,
  isDownloading: false,
  downloadProgress: { progressPercent: 0, writtenMB: '0', totalMB: '0' },
  selectedModelKey: 'gemma2b',

  // Chat State
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  dualResponse: null,

  // Actions
  checkModelStatus: async () => {
    const key = get().selectedModelKey;
    const isDownloaded = await LlamaService.isModelDownloaded(MODEL_CONFIGS[key].fileName);
    if (isDownloaded) {
      try {
        await LlamaService.initModel(MODEL_CONFIGS[key].fileName);
        set({ isModelReady: true });
      } catch (e) {
        console.error("Failed to init llama model:", e);
      }
    } else {
      set({ isModelReady: false });
    }
  },

  startModelDownload: async (modelKey = 'gemma2b') => {
    set({ isDownloading: true, selectedModelKey: modelKey });
    try {
      await LlamaService.downloadModel(modelKey, (progress) => {
        set({ downloadProgress: progress });
      });
      // After download completes, init engine
      await LlamaService.initModel(MODEL_CONFIGS[modelKey].fileName);
      set({ isDownloading: false, isModelReady: true });
    } catch (e) {
      console.error("Download failed:", e);
      set({ isDownloading: false });
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

    set((state) => ({
      isTyping: true,
      dualResponse: {
        prompt: content,
        response_a: { content: '', token_count: 0 },
        response_b: { content: '', token_count: 0 },
        streaming_complete: false,
      },
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, messages: [...(c.messages || []), userMsg] } : c
      )
    }));

    try {
      let pendingA = "";
      let pendingB = "";
      let lastUpdate = Date.now();

      await LlamaService.generateDualResponse(
        [userMsg],
        (tokenA) => {
          pendingA += tokenA;
          if (Date.now() - lastUpdate > 50) {
            set((state) => ({
              dualResponse: {
                ...state.dualResponse,
                response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA }
              }
            }));
            pendingA = "";
            lastUpdate = Date.now();
          }
        },
        (tokenB) => {
          pendingB += tokenB;
          if (Date.now() - lastUpdate > 50) {
            set((state) => ({
              dualResponse: {
                ...state.dualResponse,
                response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB }
              }
            }));
            pendingB = "";
            lastUpdate = Date.now();
          }
        }
      );

      set((state) => ({
        isTyping: false,
        dualResponse: {
          ...state.dualResponse,
          response_a: { ...state.dualResponse.response_a, content: state.dualResponse.response_a.content + pendingA },
          response_b: { ...state.dualResponse.response_b, content: state.dualResponse.response_b.content + pendingB },
          streaming_complete: true
        }
      }));
    } catch (e) {
      console.error("Local generation failed:", e);
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
