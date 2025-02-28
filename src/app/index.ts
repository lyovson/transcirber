import { FileService } from '../services/file-service/index.ts'
import { TranscriptionService } from '../services/transcription/index.ts'
import { AudioSplitterService } from '../services/audio-splitter/index.ts'
import { TranscriptionConfig } from '../types/index.ts'
import { setupEnv } from '../utils/env.ts'

/**
 * Result type for the transcription process
 */
export type TranscriptionResult = {
  success: boolean
  data?: string
  error?: string
  outputPath?: string
}

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
   * @param inputFilePath - Path to the input audio file
   * @param outputDir - Optional output directory for the transcription
   * @returns A TranscriptionResult object
   */
  async run(inputFilePath: string, outputDir?: string): Promise<TranscriptionResult> {
    try {
      // Ensure the transcription service is initialized
      if (!this.transcriptionService) {
        return {
          success: false,
          error: 'TranscriptionService not initialized. Call initialize() first.',
        }
      }

      // Check if the file exists
      const fileExists = await this.fileService.fileExists(inputFilePath)
      if (!fileExists) {
        return {
          success: false,
          error: `Input file not found: ${inputFilePath}`,
        }
      }

      console.log(`Processing: ${inputFilePath}`)

      // Set output directory if provided
      if (outputDir) {
        this.fileService.setOutputDir(outputDir)
      }

      // Get temp directory for chunks
      const tempDir = this.fileService.getTempDir()

      // Split the audio file into chunks
      console.log(`Splitting audio file into ${this.chunkDuration}-second chunks...`)
      const splitResult = await this.audioSplitterService.splitAudio({
        inputFile: inputFilePath,
        outputDir: tempDir,
        segmentDuration: this.chunkDuration,
        filePrefix: `chunk_${inputFilePath.split('/').pop()?.split('.')[0]}`,
      })

      if (!splitResult.ok) {
        return {
          success: false,
          error: `Failed to split audio file: ${splitResult.error.message}`,
        }
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
      if (chunkTranscriptions.length === 0) {
        return {
          success: false,
          error: 'Failed to transcribe any chunks',
        }
      }

      const combinedText = this.fileService.combineChunkTranscriptions(chunkTranscriptions)

      // Save the transcription only as Markdown
      const fileName = inputFilePath.split('/').pop() || 'transcription'

      // Save as Markdown
      const mdOutputPath = await this.fileService.saveTranscription(combinedText, fileName, 'md')

      // Clean up temporary files
      await this.fileService.cleanupTempFiles()

      console.log('Transcription process completed.')

      return {
        success: true,
        data: combinedText,
        outputPath: mdOutputPath, // Return the Markdown file path
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error processing audio file:', errorMessage)

      return {
        success: false,
        error: errorMessage,
      }
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

  /**
   * Updates the output directory
   * @param outputDir - New output directory
   */
  updateOutputDir(outputDir: string): Promise<void> {
    if (outputDir && this.fileService) {
      this.fileService.setOutputDir(outputDir)
      console.log(`TranscriptionApp output directory updated to: ${outputDir}`)
    }
    return Promise.resolve()
  }
}
