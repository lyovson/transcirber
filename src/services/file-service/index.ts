import { ensureDir } from 'https://deno.land/std@0.220.1/fs/ensure_dir.ts'
import { extname, join, parse } from 'https://deno.land/std@0.220.1/path/mod.ts'
import { Result } from 'types'

/**
 * Service for handling file operations
 */
export class FileService {
  private readonly inputDir: string
  private readonly outputDir: string
  private readonly tempDir: string
  private readonly combinedOutputFile: string

  /**
   * Creates a new FileService instance
   * Uses environment variables INPUT_DIR and OUTPUT_DIR if available
   */
  constructor() {
    // Use environment variables with fallbacks
    this.inputDir = Deno.env.get('INPUT_DIR') || join(Deno.cwd(), 'inputs')
    this.outputDir = Deno.env.get('OUTPUT_DIR') || join(Deno.cwd(), 'outputs')
    this.tempDir = join(this.outputDir, 'temp')
    this.combinedOutputFile = join(
      this.outputDir,
      'combined_transcription.md',
    )
  }

  /**
   * Ensures the input, output, and temp directories exist
   */
  async ensureDirectories(): Promise<void> {
    await ensureDir(this.inputDir)
    await ensureDir(this.outputDir)
    await ensureDir(this.tempDir)
  }

  /**
   * Gets all audio files from the input directory
   * @returns Array of audio file names
   */
  async getAudioFiles(): Promise<string[]> {
    try {
      const files: string[] = []

      for await (const entry of Deno.readDir(this.inputDir)) {
        if (entry.isFile) files.push(entry.name)
      }

      // Filter for audio files (mp3, wav, etc.)
      return files.filter((file) => {
        const ext = extname(file).toLowerCase()
        return ['.mp3', '.wav', '.m4a', '.ogg', '.flac'].includes(ext)
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Error reading input directory: ${errorMessage}`)
      await this.ensureDirectories()
      return []
    }
  }

  /**
   * Reads an audio file and converts it to a Blob
   * @param fileName - Name of the audio file
   * @returns Audio blob
   */
  async readAudioFile(fileName: string): Promise<Blob> {
    const filePath = join(this.inputDir, fileName)
    const audioBuffer = await Deno.readFile(filePath)
    const fileExt = extname(filePath).substring(1)

    return new Blob([audioBuffer], {
      type: `audio/${fileExt}`,
    })
  }

  /**
   * Reads an audio file from a specific path and converts it to a Blob
   * @param filePath - Full path to the audio file
   * @returns Audio blob
   */
  async readAudioFileFromPath(filePath: string): Promise<Result<Blob, Error>> {
    try {
      const audioBuffer = await Deno.readFile(filePath)
      const fileExt = extname(filePath).substring(1)

      return {
        ok: true,
        data: new Blob([audioBuffer], { type: `audio/${fileExt}` }),
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }

  /**
   * Saves transcription to individual file
   * @param text - Transcription text
   * @param fileName - Original audio file name
   * @returns Path to the saved file
   */
  async saveTranscription(text: string, fileName: string): Promise<string> {
    const baseName = parse(fileName).name
    const outputFileName = `${baseName}.txt`
    const outputPath = join(this.outputDir, outputFileName)

    await Deno.writeTextFile(outputPath, text)
    console.log(`Transcription saved to: ${outputPath}`)

    return outputPath
  }

  /**
   * Combines all individual transcriptions into a single markdown file
   * @param transcriptions - Map of filename to transcription text
   */
  async combineTranscriptions(
    transcriptions: Map<string, string>,
  ): Promise<void> {
    if (transcriptions.size === 0) {
      console.log('No transcriptions to combine')
      return
    }

    // Sort the transcriptions by filename to maintain order
    const sortedEntries = [...transcriptions.entries()].sort()

    // Create markdown content
    let markdownContent = '# Transcription\n\n'

    for (const [fileName, text] of sortedEntries) {
      markdownContent += `## ${fileName}\n\n${text}\n\n`
    }

    // Write the combined file
    await Deno.writeTextFile(this.combinedOutputFile, markdownContent)
    console.log(`Combined transcription saved to: ${this.combinedOutputFile}`)
  }

  /**
   * Combines chunk transcriptions into a single text
   * @param chunkTranscriptions - Array of chunk transcriptions in order
   * @returns Combined transcription text
   */
  combineChunkTranscriptions(chunkTranscriptions: string[]): string {
    return chunkTranscriptions.join(' ')
  }

  /**
   * Gets the full path to the input file
   * @param fileName - Name of the input file
   * @returns Full path to the input file
   */
  getInputFilePath(fileName: string): string {
    return join(this.inputDir, fileName)
  }

  /**
   * Gets the temp directory path
   * @returns Path to the temp directory
   */
  getTempDir(): string {
    return this.tempDir
  }

  /**
   * Cleans up temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      for await (const entry of Deno.readDir(this.tempDir)) {
        if (entry.isFile) {
          await Deno.remove(join(this.tempDir, entry.name))
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error)
    }
  }
}
