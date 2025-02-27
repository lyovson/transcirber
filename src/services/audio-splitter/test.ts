import { assertEquals, assertExists } from 'https://deno.land/std@0.220.1/assert/mod.ts'
import { AudioSplitterService } from './index.ts'
import { ensureDir } from 'https://deno.land/std@0.220.1/fs/ensure_dir.ts'
import { join } from 'https://deno.land/std@0.220.1/path/mod.ts'

// Mock Deno.Command to avoid actual FFmpeg execution during tests
const originalCommand = Deno.Command
const mockCommandOutput = {
  code: 0,
  stdout: new Uint8Array(),
  stderr: new Uint8Array(),
}

// Test suite for AudioSplitterService
Deno.test('AudioSplitterService', async (t) => {
  // Setup test environment
  const testDir = join(Deno.cwd(), 'test-output')
  await ensureDir(testDir)

  // Create a test audio file
  const testAudioPath = join(testDir, 'test.mp3')
  try {
    await Deno.writeFile(testAudioPath, new Uint8Array([0, 1, 2, 3]))
  } catch (e) {
    console.error('Error creating test file:', e)
  }

  // Mock file listing for readDir
  const mockEntries = [
    { name: 'chunk_000.mp3', isFile: true, isDirectory: false, isSymlink: false },
    { name: 'chunk_001.mp3', isFile: true, isDirectory: false, isSymlink: false },
  ]

  await t.step('splitAudio returns correct result with mocked FFmpeg', async () => {
    // Mock Deno.Command
    Deno.Command = function () {
      return {
        output: () => mockCommandOutput,
      } as unknown as Deno.Command
    } as unknown as typeof Deno.Command

    // Mock Deno.readDir
    const originalReadDir = Deno.readDir
    Deno.readDir = () => {
      return {
        [Symbol.asyncIterator]() {
          let index = 0
          return {
            next() {
              if (index < mockEntries.length) {
                return { value: mockEntries[index++], done: false }
              }
              return { value: undefined, done: true }
            },
          }
        },
      } as unknown as AsyncIterable<Deno.DirEntry>
    }

    try {
      const service = new AudioSplitterService()
      const result = await service.splitAudio({
        inputFile: testAudioPath,
        outputDir: testDir,
        segmentDuration: 30,
      })

      assertEquals(result.ok, true)
      assertExists(result.ok && result.data)
      assertEquals(result.ok && result.data.length, 2)
    } finally {
      // Restore original functions
      Deno.Command = originalCommand
      Deno.readDir = originalReadDir
    }
  })

  // Cleanup
  try {
    await Deno.remove(testAudioPath)
    await Deno.remove(testDir, { recursive: true })
  } catch (e) {
    console.error('Error cleaning up test files:', e)
  }
})
