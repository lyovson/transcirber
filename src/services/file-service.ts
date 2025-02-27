import { ensureDir } from 'https://deno.land/std@0.220.1/fs/ensure_dir.ts'
import { extname, join, parse } from 'https://deno.land/std@0.220.1/path/mod.ts'

/**
 * Service for handling file operations
 */
export class FileService {
  private inputDir: string
  private outputDir: string
  private combinedOutputFile: string

  /**
   * Creates a new FileService instance
   * @param inputDir - Directory containing input audio files
   * @param outputDir - Directory for output transcription files
   */
  constructor(
    inputDir = join(Deno.cwd(), 'inputs'),
    outputDir = join(Deno.cwd(), 'outputs'),
  ) {
    this.inputDir = inputDir
    this.outputDir = outputDir
    this.combinedOutputFile = join(
      this.outputDir,
      'combined_transcription.txt',
    )
  }

  /**
   * Ensures the input and output directories exist
   */
  async ensureDirectories(): Promise<void> {
    await ensureDir(this.inputDir)
    await ensureDir(this.outputDir)
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
   * Combines all individual transcriptions into a single file
   * @param transcriptions - Map of filename to transcription text
   */
  async combineTranscriptions(
    transcriptions: Map<string, string>,
  ): Promise<void> {
    if (transcriptions.size === 0) return

    let combinedText = '# Combined Transcriptions\n\n'

    // Sort files alphabetically for consistent output
    const sortedEntries = [...transcriptions.entries()].sort(
      ([fileA], [fileB]) => fileA.localeCompare(fileB),
    )

    for (const [fileName, text] of sortedEntries) {
      combinedText += `## ${fileName}\n\n${text}\n\n---\n\n`
    }

    await Deno.writeTextFile(this.combinedOutputFile, combinedText)
    console.log(`Combined transcription saved to: ${this.combinedOutputFile}`)
  }

  /**
   * Gets the path to the combined output file
   */
  getCombinedOutputFilePath(): string {
    return this.combinedOutputFile
  }
}
