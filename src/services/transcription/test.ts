import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts'
import { TranscriptionService } from './index.ts'

Deno.test('TranscriptionService', async (t) => {
  await t.step('should create a TranscriptionService instance', () => {
    const service = new TranscriptionService()
    assertEquals(typeof service, 'object', 'Service should be an object')
  })

  await t.step('should have a transcribe method', () => {
    const service = new TranscriptionService()
    assertEquals(typeof service.transcribe, 'function', 'Service should have a transcribe method')
  })

  await t.step('should handle transcription', async () => {
    // Save original environment getter
    const originalEnvGet = Deno.env.get

    // Mock environment to provide API key
    Deno.env.get = (key: string) => {
      if (key === 'ELEVENLABS_API_KEY') return 'mock-api-key'
      return originalEnvGet(key)
    }

    // Create a test-only subclass that overrides the client creation
    class TestTranscriptionService extends TranscriptionService {
      constructor() {
        super()
        // Override the client with our mock
        Object.defineProperty(this, 'client', {
          value: {
            speechToText: {
              convert: () => {
                return { text: 'This is a mock transcription' }
              },
            },
          },
          writable: true,
        })
      }
    }

    try {
      // Create our test service
      const service = new TestTranscriptionService()

      // Create a mock audio blob
      const audioBlob = new Blob(['mock audio data'], { type: 'audio/mp3' })

      // Call the transcribe method
      const result = await service.transcribe(audioBlob)

      // Assert the result
      assertEquals(result.ok, true, 'Transcription should be successful')
      assertEquals(
        result.ok && result.data,
        'This is a mock transcription',
        'Should return the mock transcription text',
      )
    } finally {
      // Restore original environment getter
      Deno.env.get = originalEnvGet
    }
  })
})
