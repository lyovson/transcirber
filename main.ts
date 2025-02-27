import { TranscriptionApp } from './src/app.ts'
import { getChunkDuration, getLanguageCode } from './src/utils/env.ts'

/**
 * Main entry point for the application
 */
async function main(): Promise<void> {
  console.log('Starting audio transcription application...')

  // Get chunk duration from environment or use default
  const chunkDuration = getChunkDuration()
  console.log(`Using ${chunkDuration}-second chunks for audio splitting`)

  // Get language code from environment
  const languageCode = getLanguageCode()
  console.log(`Using language code: ${languageCode}`)

  // Create and initialize the application with configured chunk duration
  const app = new TranscriptionApp({
    modelId: 'scribe_v1',
    tagAudioEvents: false,
    languageCode,
    diarize: false,
  }, chunkDuration)

  console.log('App created, initializing...')

  // Initialize the application
  const initialized = await app.initialize()
  if (!initialized) {
    console.error('Failed to initialize the application')
    Deno.exit(1)
  }

  console.log('App initialized successfully, running transcription process...')

  // Run the transcription process
  await app.run()
}

// Run the main function
await main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error('Fatal error:', errorMessage)
  Deno.exit(1)
})
