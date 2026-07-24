import * as FileSystem from 'expo-file-system/legacy';
import { initLlama } from 'llama.rn';

// ONLY Gemma 2B Specialist model as requested
export const MODEL_CONFIG = {
  id: 'gemma-2b-q4',
  name: 'Gemma 2B Specialist (Official)',
  url: 'https://huggingface.co/lmstudio-community/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf?download=true',
  fileName: 'gemma-2-2b-it-Q4_K_M.gguf',
  sizeBytes: 1680000000, // ~1.68 GB
  minSizeBytes: 1400000000, // ~1.4 GB minimum to verify completeness
};

const MODEL_DIR = `${FileSystem.documentDirectory}models/`;

class LlamaService {
  constructor() {
    this.context = null;
    this.downloadResumable = null;
    this.isInitialized = false;
    this.isDownloading = false;
  }

  /** Get full local path for model GGUF file */
  getModelPath(fileName = MODEL_CONFIG.fileName) {
    return `${MODEL_DIR}${fileName}`;
  }

  /** Check if model file exists locally and is completely downloaded */
  async isModelDownloaded(fileName = MODEL_CONFIG.fileName) {
    try {
      const path = this.getModelPath(fileName);
      const info = await FileSystem.getInfoAsync(path);
      // File must exist and be > 1.4 GB to ensure it was not interrupted midway
      const isComplete = info.exists && info.size >= MODEL_CONFIG.minSizeBytes;
      console.log(`[LlamaService] Checking model file: exists=${info.exists}, size=${info.size} bytes, isComplete=${isComplete}`);
      return isComplete;
    } catch (e) {
      console.error("[LlamaService] Error checking model file:", e);
      return false;
    }
  }

  /**
   * Background-capable Model Downloader
   */
  async downloadModel(onProgress) {
    // Ensure models directory exists
    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }

    const localPath = this.getModelPath(MODEL_CONFIG.fileName);

    const callback = (downloadProgress) => {
      const expectedBytes = downloadProgress.totalBytesExpectedToWrite > 0 
        ? downloadProgress.totalBytesExpectedToWrite 
        : MODEL_CONFIG.sizeBytes;

      const progress = downloadProgress.totalBytesWritten / expectedBytes;
      const progressPercent = Math.min(100, Math.max(0, Math.round(progress * 100)));
      const writtenMB = (downloadProgress.totalBytesWritten / (1024 * 1024)).toFixed(1);
      const totalMB = (expectedBytes / (1024 * 1024)).toFixed(1);

      if (onProgress) {
        onProgress({
          progressPercent,
          writtenMB,
          totalMB,
          bytesWritten: downloadProgress.totalBytesWritten,
          totalBytes: expectedBytes,
        });
      }
    };

    // Use background session type if supported by FileSystem to allow downloading in background
    const options = {
      sessionType: FileSystem.FileSystemSessionType ? FileSystem.FileSystemSessionType.BACKGROUND : undefined,
    };

    this.downloadResumable = FileSystem.createDownloadResumable(
      MODEL_CONFIG.url,
      localPath,
      options,
      callback
    );

    this.isDownloading = true;

    try {
      console.log(`[LlamaService] Starting background download from ${MODEL_CONFIG.url} to ${localPath}...`);
      const result = await this.downloadResumable.downloadAsync();
      this.isDownloading = false;

      // Verify file size after download
      const downloadedInfo = await FileSystem.getInfoAsync(localPath);
      if (!downloadedInfo.exists || downloadedInfo.size < MODEL_CONFIG.minSizeBytes) {
        throw new Error(`Downloaded model file incomplete (${(downloadedInfo.size / (1024*1024)).toFixed(1)} MB). Expected ~1.68 GB.`);
      }

      console.log("[LlamaService] Model download completed successfully!");
      return result.uri;
    } catch (e) {
      this.isDownloading = false;
      console.error("[LlamaService] Model download failed:", e);
      throw e;
    }
  }

  /** Pause active download */
  async pauseDownload() {
    if (this.downloadResumable) {
      await this.downloadResumable.pauseAsync();
    }
  }

  /** Resume paused download if exists */
  async resumeDownload(onProgress) {
    if (this.downloadResumable) {
      try {
        const result = await this.downloadResumable.resumeAsync();
        return result?.uri;
      } catch (e) {
        console.error("[LlamaService] Resume download failed, restarting:", e);
        return this.downloadModel(onProgress);
      }
    }
  }

  /** Initialize SINGLE Llama context on ARM CPU (RAM usage ~1.5GB) */
  async initModel(fileName = MODEL_CONFIG.fileName) {
    const localPath = this.getModelPath(fileName);
    const exists = await this.isModelDownloaded(fileName);
    if (!exists) {
      throw new Error("Model file missing or incomplete. Please download the full 1.68 GB Gemma 2B model.");
    }

    try {
      console.log(`[LlamaService] Initializing Gemma 2B model from ${localPath}...`);
      
      // Release previous context if initialized
      if (this.context) {
        await this.context.release();
        this.context = null;
      }

      // Initialize single LlamaContext with safe mobile parameters (use_mlock: false)
      this.context = await initLlama({
        model: localPath,
        n_ctx: 2048,
        n_threads: 4,
        use_mlock: false, // DO NOT lock memory on Android to avoid OOM / kernel permission errors
      });

      this.isInitialized = true;
      console.log("[LlamaService] Gemma 2B model initialized successfully on device!");
      return true;
    } catch (e) {
      this.isInitialized = false;
      console.error("[LlamaService] Failed to initialize Llama context:", e);
      throw new Error(`Model Engine Error: ${e.message || "Failed to load Gemma 2B weights into memory."}`);
    }
  }

  /** Generate Dual Streaming Responses (Response A: Temp 0.3 Precise, Response B: Temp 0.6 Balanced) */
  async generateDualResponse(messages, onChunkA, onChunkB) {
    if (!this.context || !this.isInitialized) {
      throw new Error("Gemma 2B model is not initialized yet");
    }

    const formattedPrompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') + '\nASSISTANT:';

    // 1. Generate Response A (Temperature 0.3 - Precise & Factual)
    console.log("[LlamaService] Streaming Response A (Temp 0.3 Precise)...");
    await this.context.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.3,
        stop: ["USER:", "\n\nUSER:", "<eos>"],
      },
      (data) => {
        if (data.token && onChunkA) onChunkA(data.token);
      }
    );

    // 2. Generate Response B (Temperature 0.6 - Balanced Advice)
    console.log("[LlamaService] Streaming Response B (Temp 0.6 Balanced)...");
    await this.context.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.6,
        stop: ["USER:", "\n\nUSER:", "<eos>"],
      },
      (data) => {
        if (data.token && onChunkB) onChunkB(data.token);
      }
    );
  }

  /** Stop active generation */
  async stopGeneration() {
    if (this.context) {
      try {
        await this.context.stopCompletion();
      } catch (e) {
        console.error("[LlamaService] Stop completion error:", e);
      }
    }
  }

  /** Unload model from memory */
  async release() {
    if (this.context) {
      try {
        await this.context.release();
      } catch (e) {
        console.error("[LlamaService] Release context error:", e);
      }
      this.context = null;
      this.isInitialized = false;
    }
  }
}

export default new LlamaService();
