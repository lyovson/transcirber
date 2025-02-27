import { EnvVars, Result } from '../types/index.ts'

/**
 * Loads environment variables from .env file
 */
export async function loadEnv(): Promise<Result<Partial<EnvVars>, Error>> {
  try {
    const text = await Deno.readTextFile('.env')
    const result: Record<string, string> = {}

    text.split('\n').forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value) result[key.trim()] = value.trim()
    })

    return { ok: true, data: result as Partial<EnvVars> }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error loading .env file:', errorMessage)
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(errorMessage),
    }
  }
}

/**
 * Sets up environment variables for the application
 */
export async function setupEnv(): Promise<boolean> {
  try {
    // Load environment variables from .env file
    const envResult = await loadEnv()

    if (!envResult.ok) {
      console.error('Failed to load .env file')
      return false
    }

    // Set environment variables
    for (const [key, value] of Object.entries(envResult.data)) {
      if (value) {
        Deno.env.set(key, value)
      }
    }

    // Verify the API key is set
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      console.error('Error: ELEVENLABS_API_KEY not found in .env file')
      return false
    }

    return true
  } catch (error) {
    console.error('Error setting up environment:', error)
    return false
  }
}
