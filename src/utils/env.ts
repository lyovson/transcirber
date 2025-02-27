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
  const envResult = await loadEnv()

  if (envResult.ok && 'ELEVENLABS_API_KEY' in envResult.data && envResult.data.ELEVENLABS_API_KEY) {
    Deno.env.set('ELEVENLABS_API_KEY', envResult.data.ELEVENLABS_API_KEY)
    return true
  }

  console.error('Error: ELEVENLABS_API_KEY not found in .env file')
  return false
}
