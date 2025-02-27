import { assertEquals } from 'https://deno.land/std@0.220.1/assert/mod.ts'
import { FileService } from './index.ts'
import { ensureDir } from 'https://deno.land/std@0.220.1/fs/ensure_dir.ts'
import { join } from 'https://deno.land/std@0.220.1/path/mod.ts'

// Test suite for FileService
Deno.test('FileService', async (t) => {
  // Setup test environment
  const testDir = join(Deno.cwd(), 'test-file-service')
  const testInputDir = join(testDir, 'inputs')
  const testOutputDir = join(testDir, 'outputs')

  await ensureDir(testInputDir)
  await ensureDir(testOutputDir)

  // Create test audio files
  const testAudioPath1 = join(testInputDir, 'test1.mp3')
  const testAudioPath2 = join(testInputDir, 'test2.wav')
  const testNonAudioPath = join(testInputDir, 'document.pdf')

  try {
    await Deno.writeFile(testAudioPath1, new Uint8Array([0, 1, 2, 3]))
    await Deno.writeFile(testAudioPath2, new Uint8Array([4, 5, 6, 7]))
    await Deno.writeFile(testNonAudioPath, new Uint8Array([8, 9, 10]))
  } catch (e) {
    console.error('Error creating test files:', e)
  }

  // Create a FileService instance with test directories
  const originalEnvGet = Deno.env.get

  // Mock environment variables
  Deno.env.get = (key: string) => {
    if (key === 'INPUT_DIR') return testInputDir
    if (key === 'OUTPUT_DIR') return testOutputDir
    return originalEnvGet(key)
  }

  const fileService = new FileService()

  await t.step('ensureDirectories creates required directories', async () => {
    await fileService.ensureDirectories()

    const inputInfo = await Deno.stat(testInputDir)
    const outputInfo = await Deno.stat(testOutputDir)
    const tempInfo = await Deno.stat(join(testOutputDir, 'temp'))

    assertEquals(inputInfo.isDirectory, true, 'Input directory should exist')
    assertEquals(outputInfo.isDirectory, true, 'Output directory should exist')
    assertEquals(tempInfo.isDirectory, true, 'Temp directory should exist')
  })

  await t.step('getAudioFiles returns only audio files', async () => {
    const audioFiles = await fileService.getAudioFiles()

    assertEquals(audioFiles.length, 2, 'Should find 2 audio files')
    assertEquals(audioFiles.includes('test1.mp3'), true, 'Should include MP3 file')
    assertEquals(audioFiles.includes('test2.wav'), true, 'Should include WAV file')
    assertEquals(audioFiles.includes('document.pdf'), false, 'Should not include PDF file')
  })

  await t.step('getInputFilePath returns correct path', () => {
    const path = fileService.getInputFilePath('test1.mp3')
    assertEquals(path, join(testInputDir, 'test1.mp3'), 'Should return correct input file path')
  })

  await t.step('getTempDir returns correct path', () => {
    const tempDir = fileService.getTempDir()
    assertEquals(tempDir, join(testOutputDir, 'temp'), 'Should return correct temp directory path')
  })

  await t.step('combineChunkTranscriptions combines text correctly', () => {
    const chunks = [
      'This is chunk one.',
      'This is chunk two.',
      'This is chunk three.',
    ]

    const combined = fileService.combineChunkTranscriptions(chunks)
    assertEquals(
      combined,
      'This is chunk one. This is chunk two. This is chunk three.',
      'Should combine chunks with spaces',
    )
  })

  // Cleanup
  try {
    Deno.env.get = originalEnvGet
    await Deno.remove(testDir, { recursive: true })
  } catch (e) {
    console.error('Error cleaning up test files:', e)
  }
})
