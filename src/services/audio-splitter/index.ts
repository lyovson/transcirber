/**
 * Service for splitting audio files into smaller chunks
 */
import { ensureDir } from 'https://deno.land/std@0.220.1/fs/ensure_dir.ts'
import { join, parse } from 'https://deno.land/std@0.220.1/path/mod.ts'
import { Result } from 'types'

/** Configuration for audio splitting */
export type AudioSplitOptions = {
  readonly inputFile: string
  readonly outputDir: string
  readonly segmentDuration: number
  readonly filePrefix?: string
}

/**
 * Service to split audio files into smaller segments
 */
export class AudioSplitterService {
  /**
   * Splits an audio file into segments of specified duration
   */
  async splitAudio(options: AudioSplitOptions): Promise<Result<string[], Error>> {
    const { inputFile, outputDir, segmentDuration, filePrefix = 'chunk' } = options

    try {
      // Verify input file exists
      try {
        const fileInfo = await Deno.stat(inputFile)
        if (!fileInfo.isFile) {
          return {
            ok: false,
            error: new Error(`Input path "${inputFile}" is not a file`),
          }
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return {
            ok: false,
            error: new Error(`Input file "${inputFile}" does not exist`),
          }
        }
        return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
      }

      // Create output directory if it doesn't exist
      await ensureDir(outputDir)

      // Get the base name and extension of the input file
      const { ext } = parse(inputFile)

      // Normalize the input file path
      const normalizedInput = await Deno.realPath(inputFile)

      // Execute FFmpeg command using Deno.Command API
      const command = new Deno.Command('ffmpeg', {
        args: [
          '-i',
          normalizedInput,
          '-f',
          'segment',
          '-segment_time',
          segmentDuration.toString(),
          '-c',
          'copy',
          '-map',
          '0:a',
          `${outputDir}/${filePrefix}_%03d${ext}`,
        ],
        stdout: 'piped',
        stderr: 'piped',
      })

      // Run the command and wait for it to complete
      const { code, stderr } = await command.output()

      if (code !== 0) {
        const errorOutput = new TextDecoder().decode(stderr)
        return {
          ok: false,
          error: new Error(`FFmpeg process failed with code ${code}: ${errorOutput}`),
        }
      }

      // Get the list of generated files
      const outputFiles: string[] = []
      for await (const entry of Deno.readDir(outputDir)) {
        if (entry.isFile && entry.name.startsWith(`${filePrefix}_`) && entry.name.endsWith(ext)) {
          outputFiles.push(join(outputDir, entry.name))
        }
      }

      // Sort files by their numeric suffix to maintain order
      outputFiles.sort((a, b) => {
        const numA = parseInt(a.match(/(\d+)(?=\.[^.]+$)/)?.[0] || '0', 10)
        const numB = parseInt(b.match(/(\d+)(?=\.[^.]+$)/)?.[0] || '0', 10)
        return numA - numB
      })

      return { ok: true, data: outputFiles }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }
}
