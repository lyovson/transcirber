import { FileService } from './services/file-service.ts'
import { TranscriptionService } from './services/transcription-service.ts'
import { TranscriptionConfig } from './types/index.ts'
import { setupEnv } from './utils/env.ts'

/**
 * Main application class for audio transcription
 */
export class TranscriptionApp {
  private readonly fileService: FileService
  private readonly transcriptionService: TranscriptionService

  /**
   * Creates a new TranscriptionApp instance
   */
  constructor(config: Partial<TranscriptionConfig> = {}) {
    this.fileService = new FileService()
    this.transcriptionService = new TranscriptionService(config)
  }

  /**
   * Initializes the application
   */
  async initialize(): Promise<boolean> {
    // Setup environment variables
    const envSetup = await setupEnv()
    if (!envSetup) return false

    // Ensure directories exist
    await this.fileService.ensureDirectories()

    return true
  }

  /**
   * Runs the transcription process
   */
  async run(): Promise<void> {
    try {
      // Get audio files
      const audioFiles = await this.fileService.getAudioFiles()

      if (audioFiles.length === 0) {
        console.log('No audio files found in the inputs directory.')
        return
      }

      console.log(`Found ${audioFiles.length} audio files to transcribe.`)

      // Store all transcriptions for combining later
      const transcriptions = new Map<string, string>()

      // Process each audio file
      for (const file of audioFiles) {
        console.log(`Processing: ${file}`)

        // Read and convert the audio file
        const audioBlob = await this.fileService.readAudioFile(file)

        // Transcribe the audio
        const result = await this.transcriptionService.transcribe(audioBlob)

        if (result.ok) {
          // Save individual transcription
          await this.fileService.saveTranscription(result.data, file)

          // Store for combined output
          const fileName = file.split('.')[0]
          transcriptions.set(fileName, result.data)
        } else {
          console.log(`Failed to transcribe: ${file} - ${result.error.message}`)
        }
      }

      // Combine all transcriptions into a single file
      await this.fileService.combineTranscriptions(transcriptions)

      console.log('Transcription process completed.')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error processing audio files:', errorMessage)
    }
  }

  /**
   * Updates the transcription configuration
   */
  updateConfig(config: Partial<TranscriptionConfig>): void {
    this.transcriptionService.updateConfig(config)
  }
}
