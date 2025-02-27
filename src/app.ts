import { FileService } from './services/file-service/index.ts'
import { TranscriptionService } from './services/transcription/index.ts'
import { AudioSplitterService } from './services/audio-splitter/index.ts'
import { TranscriptionConfig } from './types/index.ts'
import { setupEnv } from './utils/env.ts'

/**
 * Main application class for audio transcription
 */
export class TranscriptionApp {
  private readonly fileService: FileService
  private transcriptionService: TranscriptionService | null = null
  private readonly audioSplitterService: AudioSplitterService
  private readonly chunkDuration: number
  private readonly config: Partial<TranscriptionConfig>

  /**
   * Creates a new TranscriptionApp instance
   */
  constructor(config: Partial<TranscriptionConfig> = {}, chunkDuration = 30) {
    this.fileService = new FileService()
    this.audioSplitterService = new AudioSplitterService()
    this.chunkDuration = chunkDuration
    this.config = config
  }

  /**
   * Initializes the application
   */
  async initialize(): Promise<boolean> {
    // Setup environment variables
    const envSetup = setupEnv()
    if (!envSetup) return false

    // Initialize the transcription service after environment variables are set up
    this.transcriptionService = new TranscriptionService(this.config)

    // Ensure directories exist
    await this.fileService.ensureDirectories()

    return true
  }

  /**
   * Runs the transcription process
   */
  async run(): Promise<void> {
    try {
      // Ensure the transcription service is initialized
      if (!this.transcriptionService) {
        throw new Error('TranscriptionService not initialized. Call initialize() first.')
      }

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

        // Get full path to input file
        const inputFilePath = this.fileService.getInputFilePath(file)

        // Get temp directory for chunks
        const tempDir = this.fileService.getTempDir()

        // Split the audio file into chunks
        console.log(`Splitting audio file into ${this.chunkDuration}-second chunks...`)
        const splitResult = await this.audioSplitterService.splitAudio({
          inputFile: inputFilePath,
          outputDir: tempDir,
          segmentDuration: this.chunkDuration,
          filePrefix: `chunk_${file.split('.')[0]}`,
        })

        if (!splitResult.ok) {
          console.error(`Failed to split audio file: ${splitResult.error.message}`)
          continue
        }

        const audioChunks = splitResult.data
        console.log(`Split audio into ${audioChunks.length} chunks.`)

        // Process each chunk
        const chunkTranscriptions: string[] = []

        for (const [index, chunkPath] of audioChunks.entries()) {
          console.log(`Transcribing chunk ${index + 1}/${audioChunks.length}...`)

          // Read the audio chunk
          const audioResult = await this.fileService.readAudioFileFromPath(chunkPath)

          if (!audioResult.ok) {
            console.error(`Failed to read audio chunk: ${audioResult.error.message}`)
            continue
          }

          // Transcribe the chunk
          const transcriptionResult = await this.transcriptionService.transcribe(audioResult.data)

          if (transcriptionResult.ok) {
            chunkTranscriptions.push(transcriptionResult.data)
          } else {
            console.error(`Failed to transcribe chunk: ${transcriptionResult.error.message}`)
          }
        }

        // Combine chunk transcriptions
        if (chunkTranscriptions.length > 0) {
          const combinedText = this.fileService.combineChunkTranscriptions(chunkTranscriptions)

          // Save the combined transcription
          await this.fileService.saveTranscription(combinedText, file)

          // Store for final output
          const fileName = file.split('.')[0]
          transcriptions.set(fileName, combinedText)
        }

        // Clean up temporary files
        await this.fileService.cleanupTempFiles()
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
    if (this.transcriptionService) {
      this.transcriptionService.updateConfig(config)
    }
  }
}
