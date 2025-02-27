import { ElevenLabsClient } from 'elevenlabs'
import { Result, TranscriptionConfig, TranscriptionResult } from '../types/index.ts'

/**
 * Service for handling transcription operations
 */
export class TranscriptionService {
  private readonly client: ElevenLabsClient
  private config: TranscriptionConfig

  /**
   * Creates a new TranscriptionService instance
   */
  constructor(config: Partial<TranscriptionConfig> = {}) {
    this.client = new ElevenLabsClient()
    this.config = {
      modelId: config.modelId || 'scribe_v1',
      tagAudioEvents: config.tagAudioEvents ?? false,
      languageCode: config.languageCode || 'hy',
      diarize: config.diarize ?? false,
    }
  }

  /**
   * Transcribes an audio file using ElevenLabs API
   */
  async transcribe(audioBlob: Blob): Promise<Result<string, Error>> {
    try {
      const transcription = (await this.client.speechToText.convert({
        file: audioBlob,
        model_id: this.config.modelId,
        tag_audio_events: this.config.tagAudioEvents,
        language_code: this.config.languageCode,
        diarize: this.config.diarize,
      })) as TranscriptionResult

      return { ok: true, data: transcription.text }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error transcribing audio:', errorMessage)
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      }
    }
  }

  /**
   * Updates the transcription configuration
   */
  updateConfig(config: Partial<TranscriptionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }
  }

  /**
   * Gets the current transcription configuration
   */
  getConfig(): TranscriptionConfig {
    return { ...this.config }
  }
}
