import { EnvVars } from '../types/index.ts'

/**
 * Loads environment variables from .env file
 * @returns Environment variables object
 */
export async function loadEnv(): Promise<Partial<EnvVars>> {
  try {
    const text = await Deno.readTextFile('.env')
    const result: Record<string, string> = {}

    text.split('\n').forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value) result[key.trim()] = value.trim()
    })

    return result as Partial<EnvVars>
  } catch (error) {
    console.error(
      'Error loading .env file:',
      error instanceof Error ? error.message : String(error),
    )
    return {}
  }
}

/**
 * Sets up environment variables for the application
 * @returns true if successful, false otherwise
 */
export async function setupEnv(): Promise<boolean> {
  const env = await loadEnv()

  if (env && 'ELEVENLABS_API_KEY' in env && env.ELEVENLABS_API_KEY) {
    Deno.env.set('ELEVENLABS_API_KEY', env.ELEVENLABS_API_KEY)
    return true
  }

  console.error('Error: ELEVENLABS_API_KEY not found in .env file')
  return false
}
