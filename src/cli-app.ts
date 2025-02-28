import { TranscriptionApp } from './app.ts'
import { getChunkDuration, getLanguageCode } from './utils/env.ts'

/**
 * Run the CLI application
 */
export async function runCLI(): Promise<void> {
  try {
    // Get configuration from environment variables
    const chunkDuration = getChunkDuration()
    const languageCode = getLanguageCode()

    // Create and initialize the transcription app
    const app = new TranscriptionApp({
      languageCode,
    }, chunkDuration)

    await app.initialize()

    // Check if a file path was provided as an argument
    const filePath = Deno.args.find((arg) => !arg.startsWith('--'))

    if (!filePath) {
      console.error('Error: No input file specified.')
      console.log('Usage: deno run -A main.ts [options] <file-path>')
      console.log('Options:')
      console.log('  --ui           Run with graphical user interface')
      Deno.exit(1)
    }

    // Run the transcription
    console.log(
      `Transcribing ${filePath} with chunk duration ${chunkDuration}s and language ${languageCode}`,
    )

    console.log('Processing file...')

    // Get output directory from environment or use default
    const outputDir = Deno.env.get('OUTPUT_DIR') || undefined

    // Call the actual transcription process
    const result = await app.run(filePath, outputDir)

    if (result.success) {
      console.log('Transcription completed successfully!')
      console.log('\nTranscription result:')
      console.log('---------------------')
      console.log(result.data)
    } else {
      console.error('Transcription failed:', result.error)
      Deno.exit(1)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Fatal error:', errorMessage)
    Deno.exit(1)
  }
}
