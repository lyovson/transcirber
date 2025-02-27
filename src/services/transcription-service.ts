import { ElevenLabsClient } from 'elevenlabs'
import { TranscriptionConfig, TranscriptionResult } from '../types/index.ts'

/**
 * Service for handling transcription operations
 */
export class TranscriptionService {
  private client: ElevenLabsClient
  private config: TranscriptionConfig

  /**
   * Creates a new TranscriptionService instance
   * @param config - Configuration for the transcription service
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
   * @param audioBlob - The audio blob to transcribe
   * @returns The transcription text or null if failed
   */
  async transcribe(audioBlob: Blob): Promise<string | null> {
    try {
      const transcription = (await this.client.speechToText.convert({
        file: audioBlob,
        model_id: this.config.modelId,
        tag_audio_events: this.config.tagAudioEvents,
        language_code: this.config.languageCode,
        diarize: this.config.diarize,
      })) as TranscriptionResult

      return transcription.text
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error transcribing audio:', errorMessage)
      return null
    }
  }

  /**
   * Updates the transcription configuration
   * @param config - New configuration options
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
