import { TranscriptionApp } from './src/app.ts'

/**
 * Main entry point for the application
 */
async function main(): Promise<void> {
  // Create and initialize the application
  const app = new TranscriptionApp({
    modelId: 'scribe_v1',
    tagAudioEvents: false,
    languageCode: 'hy',
    diarize: false,
  })

  // Initialize the application
  const initialized = await app.initialize()
  if (!initialized) {
    console.error('Failed to initialize the application')
    Deno.exit(1)
  }

  // Run the transcription process
  await app.run()
}

// Run the main function
await main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error('Fatal error:', errorMessage)
  Deno.exit(1)
})
