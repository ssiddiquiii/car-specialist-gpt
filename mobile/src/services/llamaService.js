import * as FileSystem from 'expo-file-system/legacy';
import { initLlama } from 'llama.rn';

/**
 * Centralized Model Configuration & Verification Schema
 */
export const MODEL_CONFIG = {
  id: 'gemma-2b-q4',
  name: 'Google Gemma 2 (2B) Q4_K_M',
  modelFamily: 'gemma2', // Options: 'gemma2', 'gemma4_e2b_automotive'
  isAutomotiveFineTuned: false, // Discrepancy Flag: Set true when verified Gemma 4 Automotive GGUF URL is provided
  huggingFaceRepo: 'lmstudio-community/gemma-2-2b-it-GGUF',
  url: 'https://huggingface.co/lmstudio-community/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf?download=true',
  fileName: 'gemma-2-2b-it-Q4_K_M.gguf',
  partFileName: 'gemma-2-2b-it-Q4_K_M.gguf.part',
  sizeBytes: 1680000000, // ~1.68 GB expected
  minSizeBytes: 1400000000, // ~1.4 GB absolute threshold
  requiredFreeStorageBytes: 2500000000, // ~2.5 GB free disk space needed
};

const MODEL_DIR = `${FileSystem.documentDirectory}models/`;

export const DOWNLOAD_STATES = {
  NOT_STARTED: 'not_started',
  QUEUED: 'queued',
  DOWNLOADING: 'downloading',
  PAUSED: 'paused',
  RETRYING: 'retrying',
  VERIFYING: 'verifying',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

class LlamaService {
  constructor() {
    this.context = null;
    this.downloadResumable = null;
    this.isInitialized = false;
    this.downloadState = DOWNLOAD_STATES.NOT_STARTED;
    this.downloadMeta = {
      bytesWritten: 0,
      totalBytes: MODEL_CONFIG.sizeBytes,
      progressPercent: 0,
      writtenMB: '0',
      totalMB: (MODEL_CONFIG.sizeBytes / (1024 * 1024)).toFixed(1),
      state: DOWNLOAD_STATES.NOT_STARTED,
      lastError: null,
    };
  }

  /** Full path for completed GGUF file */
  getModelPath(fileName = MODEL_CONFIG.fileName) {
    return `${MODEL_DIR}${fileName}`;
  }

  /** Full path for temporary .part download file */
  getPartModelPath() {
    return `${MODEL_DIR}${MODEL_CONFIG.partFileName}`;
  }

  /** Verify free storage before initiating large download */
  async checkFreeStorage() {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      console.log(`[LlamaService] Free disk storage: ${(freeSpace / (1024 * 1024 * 1024)).toFixed(2)} GB`);
      return freeSpace >= MODEL_CONFIG.requiredFreeStorageBytes;
    } catch (e) {
      console.warn("[LlamaService] Unable to check free disk storage:", e);
      return true; // Fallback if API unsupported
    }
  }

  /** Check if verified completed model file exists on disk */
  async isModelDownloaded(fileName = MODEL_CONFIG.fileName) {
    try {
      const path = this.getModelPath(fileName);
      const info = await FileSystem.getInfoAsync(path);
      const isComplete = info.exists && info.size >= MODEL_CONFIG.minSizeBytes;
      console.log(`[LlamaService] Checked model file: exists=${info.exists}, size=${info.size} bytes, complete=${isComplete}`);
      return isComplete;
    } catch (e) {
      console.error("[LlamaService] Error checking model file:", e);
      return false;
    }
  }

  /**
   * Resumable, Durable Model Downloader using .part temporary files and Range support
   */
  async downloadModel(onProgress) {
    const hasFreeStorage = await this.checkFreeStorage();
    if (!hasFreeStorage) {
      throw new Error("Insufficient free storage. At least 2.5 GB of free space is required.");
    }

    // Ensure models directory exists
    const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }

    const finalPath = this.getModelPath(MODEL_CONFIG.fileName);
    const partPath = this.getPartModelPath();

    // Check existing .part file for resume
    const partInfo = await FileSystem.getInfoAsync(partPath);
    let existingBytes = 0;
    if (partInfo.exists && partInfo.size > 0) {
      existingBytes = partInfo.size;
      console.log(`[LlamaService] Existing partial download found: ${(existingBytes / (1024 * 1024)).toFixed(1)} MB`);
    }

    this.downloadState = DOWNLOAD_STATES.DOWNLOADING;

    const callback = (progressData) => {
      const expectedBytes = progressData.totalBytesExpectedToWrite > 0 
        ? progressData.totalBytesExpectedToWrite 
        : MODEL_CONFIG.sizeBytes;

      const bytesWritten = progressData.totalBytesWritten;
      const progress = bytesWritten / expectedBytes;
      const progressPercent = Math.min(100, Math.max(0, Math.round(progress * 100)));
      const writtenMB = (bytesWritten / (1024 * 1024)).toFixed(1);
      const totalMB = (expectedBytes / (1024 * 1024)).toFixed(1);

      this.downloadMeta = {
        bytesWritten,
        totalBytes: expectedBytes,
        progressPercent,
        writtenMB,
        totalMB,
        state: DOWNLOAD_STATES.DOWNLOADING,
        lastError: null,
      };

      if (onProgress) {
        onProgress(this.downloadMeta);
      }
    };

    const downloadOptions = {
      sessionType: FileSystem.FileSystemSessionType ? FileSystem.FileSystemSessionType.BACKGROUND : undefined,
    };

    this.downloadResumable = FileSystem.createDownloadResumable(
      MODEL_CONFIG.url,
      partPath,
      downloadOptions,
      callback
    );

    try {
      console.log(`[LlamaService] Starting durable download to ${partPath}...`);
      const result = await this.downloadResumable.downloadAsync();
      
      // Verification Phase
      this.downloadState = DOWNLOAD_STATES.VERIFYING;
      console.log("[LlamaService] Verifying downloaded GGUF file integrity...");
      
      const downloadedInfo = await FileSystem.getInfoAsync(partPath);
      if (!downloadedInfo.exists || downloadedInfo.size < MODEL_CONFIG.minSizeBytes) {
        // Delete invalid part file
        await FileSystem.deleteAsync(partPath, { idempotent: true });
        this.downloadState = DOWNLOAD_STATES.FAILED;
        throw new Error(`Model verification failed. File size (${(downloadedInfo.size / (1024*1024)).toFixed(1)} MB) is below requirement.`);
      }

      // Atomic rename from .part to final .gguf file
      console.log(`[LlamaService] Atomic rename ${partPath} -> ${finalPath}`);
      await FileSystem.moveAsync({
        from: partPath,
        to: finalPath,
      });

      this.downloadState = DOWNLOAD_STATES.COMPLETED;
      this.downloadMeta.state = DOWNLOAD_STATES.COMPLETED;
      this.downloadMeta.progressPercent = 100;

      return finalPath;
    } catch (e) {
      this.downloadState = DOWNLOAD_STATES.FAILED;
      this.downloadMeta.state = DOWNLOAD_STATES.FAILED;
      this.downloadMeta.lastError = e.message;
      console.error("[LlamaService] Download failed:", e);
      throw e;
    }
  }

  /** Pause active download */
  async pauseDownload() {
    if (this.downloadResumable) {
      try {
        await this.downloadResumable.pauseAsync();
        this.downloadState = DOWNLOAD_STATES.PAUSED;
      } catch (e) {
        console.error("[LlamaService] Pause download failed:", e);
      }
    }
  }

  /** Initialize LlamaContext on mobile ARM CPU */
  async initModel(fileName = MODEL_CONFIG.fileName) {
    const localPath = this.getModelPath(fileName);
    const exists = await this.isModelDownloaded(fileName);
    if (!exists) {
      throw new Error("Model file missing or incomplete. Please download the Gemma 2B model.");
    }

    try {
      console.log(`[LlamaService] Initializing Gemma 2B model from ${localPath}...`);
      
      if (this.context) {
        await this.context.release();
        this.context = null;
      }

      // Safe ARM CPU mobile parameters
      this.context = await initLlama({
        model: localPath,
        n_ctx: 2048,
        n_threads: 4,
        use_mlock: false,
      });

      this.isInitialized = true;
      console.log("[LlamaService] Gemma 2B model initialized successfully!");
      return true;
    } catch (e) {
      this.isInitialized = false;
      console.error("[LlamaService] Failed to initialize Llama context:", e);
      throw new Error(`Model Engine Error: ${e.message || "Failed to load Gemma weights into memory."}`);
    }
  }

  /** Format Gemma Chat Template Turns */
  formatGemmaPrompt(messages) {
    const systemPrompt = "You are Car Specialist GPT, a expert automotive assistant specializing in vehicle diagnostics, OBD fault codes, engine maintenance, and car buying advice. Provide clear, accurate automotive answers.";

    let formatted = `<start_of_turn>user\n${systemPrompt}\n\n`;

    messages.forEach((m) => {
      if (m.role === 'user') {
        formatted += `USER: ${m.content}<end_of_turn>\n<start_of_turn>model\n`;
      } else {
        formatted += `ASSISTANT: ${m.content}<end_of_turn>\n<start_of_turn>user\n`;
      }
    });

    return formatted;
  }

  /** Generate Primary Factual Response (Temp 0.3) Immediately */
  async generatePrimaryResponse(messages, onChunk) {
    if (!this.context || !this.isInitialized) {
      throw new Error("Gemma model is not initialized yet");
    }

    const formattedPrompt = this.formatGemmaPrompt(messages);

    console.log("[LlamaService] Streaming Primary Response (Temp 0.3)...");
    const result = await this.context.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.3,
        stop: ["<end_of_turn>", "<eos>", "<|endoftext|>", "USER:"],
      },
      (data) => {
        if (data.token && onChunk) onChunk(data.token);
      }
    );

    return result;
  }

  /** Optional / On-Demand Alternate Response (Temp 0.6) */
  async generateAlternateResponse(messages, onChunk) {
    if (!this.context || !this.isInitialized) {
      throw new Error("Gemma model is not initialized yet");
    }

    const formattedPrompt = this.formatGemmaPrompt(messages);

    console.log("[LlamaService] Streaming Alternate Response (Temp 0.6)...");
    const result = await this.context.completion(
      {
        prompt: formattedPrompt,
        n_predict: 512,
        temperature: 0.6,
        stop: ["<end_of_turn>", "<eos>", "<|endoftext|>", "USER:"],
      },
      (data) => {
        if (data.token && onChunk) onChunk(data.token);
      }
    );

    return result;
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
