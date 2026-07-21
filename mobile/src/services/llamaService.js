import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import { initLlama } from 'llama.rn';

// Default Gemma 2B Q4_K_M quantized model URL on HuggingFace
export const MODEL_CONFIGS = {
  gemma2b: {
    id: 'gemma-2b-q4',
    name: 'Gemma 2B Specialist (Standard)',
    url: 'https://huggingface.co/lmstudio-community/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    fileName: 'gemma-2-2b-it-Q4_K_M.gguf',
    sizeBytes: 1680000000, // ~1.68 GB
    recommendedRamGb: 6,
  },
  llama1b: {
    id: 'llama-3.2-1b-q4',
    name: 'Llama 3.2 1B (Ultra-Light for 4GB RAM)',
    url: 'https://huggingface.co/huggingface/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    fileName: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    sizeBytes: 880000000, // ~0.88 GB
    recommendedRamGb: 4,
  }
};

const MODEL_DIR = `${FileSystem.documentDirectory}models/`;

class LlamaService {
  constructor() {
    this.contextA = null;
    this.contextB = null;
    this.downloadResumable = null;
    this.activeModel = null;
  }

  /** Get full local path for model GGUF file */
  getModelPath(fileName) {
    return `${MODEL_DIR}${fileName}`;
  }

  /** Check if a model file exists locally */
  async isModelDownloaded(fileName = MODEL_CONFIGS.gemma2b.fileName) {
    try {
      const path = this.getModelPath(fileName);
      const info = await FileSystem.getInfoAsync(path);
      return info.exists && info.size > 100000000; // > 100MB
    } catch (e) {
      return false;
    }
  }

  /**
   * Download model with progress callback
   */
  async downloadModel(modelKey = 'gemma2b', onProgress) {
    const config = MODEL_CONFIGS[modelKey];
    if (!config) throw new Error("Invalid model key");

    // Ensure models directory exists
    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }

    const localPath = this.getModelPath(config.fileName);

    const callback = (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      const progressPercent = Math.min(100, Math.round(progress * 100));
      const writtenMB = (downloadProgress.totalBytesWritten / (1024 * 1024)).toFixed(1);
      const totalMB = (downloadProgress.totalBytesExpectedToWrite / (1024 * 1024)).toFixed(1);

      if (onProgress) {
        onProgress({
          progressPercent,
          writtenMB,
          totalMB,
          bytesWritten: downloadProgress.totalBytesWritten,
          totalBytes: downloadProgress.totalBytesExpectedToWrite,
        });
      }
    };

    this.downloadResumable = FileSystem.createDownloadResumable(
      config.url,
      localPath,
      {},
      callback
    );

    try {
      const result = await this.downloadResumable.downloadAsync();
      return result.uri;
    } catch (e) {
      console.error("Model download error:", e);
      throw e;
    }
  }

  /** Pause active download */
  async pauseDownload() {
    if (this.downloadResumable) {
      await this.downloadResumable.pauseAsync();
    }
  }

  /** Initialize Llama context on ARM CPU/Metal GPU */
  async initModel(fileName = MODEL_CONFIGS.gemma2b.fileName) {
    const localPath = this.getModelPath(fileName);
    const exists = await this.isModelDownloaded(fileName);
    if (!exists) throw new Error("Model file not found locally");

    // Init Instance A (Temperature 0.7 - Factual)
    this.contextA = await initLlama({
      model: localPath,
      n_ctx: 2048,
      n_threads: 4,
      use_mlock: true,
    });

    // Init Instance B (Temperature 0.95 - Creative)
    this.contextB = await initLlama({
      model: localPath,
      n_ctx: 2048,
      n_threads: 4,
      use_mlock: true,
    });

    this.activeModel = fileName;
    console.log("Llama contexts initialized successfully on-device!");
  }

  /** Generate Dual Streaming Responses locally */
  async generateDualResponse(messages, onChunkA, onChunkB) {
    if (!this.contextA || !this.contextB) {
      throw new Error("Llama model is not initialized yet");
    }

    const formattedPrompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') + '\nASSISTANT:';

    // Stream Instance A (Temp 0.7)
    const streamAPromise = this.contextA.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.7,
        stop: ["USER:", "\n\nUSER:"],
      },
      (data) => {
        if (data.token && onChunkA) onChunkA(data.token);
      }
    );

    // Stream Instance B (Temp 0.95)
    const streamBPromise = this.contextB.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.95,
        stop: ["USER:", "\n\nUSER:"],
      },
      (data) => {
        if (data.token && onChunkB) onChunkB(data.token);
      }
    );

    await Promise.all([streamAPromise, streamBPromise]);
  }

  /** Stop active generation */
  async stopGeneration() {
    if (this.contextA) await this.contextA.stopCompletion();
    if (this.contextB) await this.contextB.stopCompletion();
  }

  /** Unload model from memory */
  async release() {
    if (this.contextA) {
      await this.contextA.release();
      this.contextA = null;
    }
    if (this.contextB) {
      await this.contextB.release();
      this.contextB = null;
    }
  }
}

export default new LlamaService();
