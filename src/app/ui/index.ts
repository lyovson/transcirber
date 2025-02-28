// import { Webview } from 'https://deno.land/x/deno_webview/mod.ts'
import { join } from 'https://deno.land/std@0.208.0/path/mod.ts'
import { TranscriptionApp } from '../index.ts'
import { ensureDir, exists } from 'https://deno.land/std@0.208.0/fs/mod.ts'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { extname } from 'https://deno.land/std@0.208.0/path/mod.ts'

/**
 * TranscriberUI class that handles the UI application
 */
export class TranscriberUI {
  private app: TranscriptionApp
  private static instance: TranscriberUI
  private outputFolders: string[] = ['outputs', 'inputs']
  private tempDir: string
  private isShuttingDown: boolean = false
  private server: Promise<void> | null = null

  /**
   * Get the singleton instance of TranscriberUI
   */
  public static getInstance(): TranscriberUI {
    if (!TranscriberUI.instance) {
      TranscriberUI.instance = new TranscriberUI()
    }
    return TranscriberUI.instance
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize the transcription app
    this.app = new TranscriptionApp({
      languageCode: 'hy', // Default Armenian
    })

    // We don't await initialization here since constructors can't be async
    // The initialization will be properly handled in run() and API endpoints

    // Initialize with default output folders
    this.initializeOutputFolders()

    // Set up temp directory for file uploads
    this.tempDir = join(Deno.cwd(), 'temp')
    this.initializeTempDir()
  }

  /**
   * Initialize the transcription app
   */
  private async initializeApp(): Promise<boolean> {
    try {
      return await this.app.initialize()
    } catch (error) {
      console.error('Error initializing transcription app:', error)
      return false
    }
  }

  /**
   * Generate a random ID for filenames
   */
  private generateId(): string {
    const randomValues = new Array(16)
    for (let i = 0; i < 16; i++) {
      randomValues[i] = Math.floor(Math.random() * 256)
    }
    return Array.from(new Uint8Array(randomValues))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Initialize temporary directory for file uploads
   */
  private async initializeTempDir() {
    try {
      await ensureDir(this.tempDir)
      console.log(`Temporary directory created at ${this.tempDir}`)
    } catch (error) {
      console.error('Error creating temp directory:', error)
    }
  }

  /**
   * Initialize available output folders
   */
  private async initializeOutputFolders() {
    try {
      // Add current directory
      this.outputFolders.push(Deno.cwd())

      // Add home directory if available
      const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE')
      if (homeDir) {
        this.outputFolders.push(homeDir)

        // Add Downloads directory as the primary output location
        const downloadsPath = join(homeDir, 'Downloads')
        if (await exists(downloadsPath)) {
          this.outputFolders.unshift(downloadsPath)

          // Set the app's output directory to Downloads by default
          if (this.app) {
            await this.app.updateOutputDir(downloadsPath)
            console.log(`Set default output directory to Downloads: ${downloadsPath}`)
          }
        }

        // Add other common subdirectories
        const commonDirs = ['Documents', 'Desktop']
        for (const dir of commonDirs) {
          const path = join(homeDir, dir)
          if (await exists(path)) {
            this.outputFolders.push(path)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing output folders:', error)
    }
  }

  /**
   * Get the path to the UI HTML file
   */
  private getUIPath(): string {
    const currentDir = Deno.cwd()
    return join(currentDir, 'src', 'ui')
  }

  /**
   * Handle HTTP requests
   */
  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // API endpoints
    if (path === '/api/uploadFile' && request.method === 'POST') {
      try {
        // Get the file data from the request body
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'No file found in form data',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 400,
            },
          )
        }

        // Generate a unique filename
        const originalName = file.name
        const ext = extname(originalName)
        const uniqueFilename = `${this.generateId()}${ext}`
        const filePath = join(this.tempDir, uniqueFilename)

        // Convert the file to an array buffer
        const arrayBuffer = await file.arrayBuffer()

        // Write the file to disk
        await Deno.writeFile(filePath, new Uint8Array(arrayBuffer))

        // Return the file path
        return new Response(
          JSON.stringify({
            success: true,
            filePath,
            originalName,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (error) {
        console.error('Error uploading file:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      }
    }

    if (path === '/api/selectOutputFolder') {
      try {
        // Use Deno's native dialog to select a folder
        // Since Deno doesn't have a built-in folder picker, we'll simulate one
        // by creating a temporary script that uses the OS's native dialog

        let selectedFolder = ''

        if (Deno.build.os === 'darwin' || Deno.build.os === 'linux') {
          // For macOS and Linux, use osascript or zenity
          try {
            if (Deno.build.os === 'darwin') {
              // Use a simpler AppleScript on macOS for better performance
              const command = new Deno.Command('osascript', {
                args: [
                  '-e',
                  'POSIX path of (choose folder with prompt "Select Output Folder")',
                ],
              })
              const { stdout } = await command.output()
              selectedFolder = new TextDecoder().decode(stdout).trim()

              // Validate the folder exists
              if (selectedFolder && await exists(selectedFolder)) {
                console.log(`Selected folder: ${selectedFolder}`)
              } else {
                console.error('Selected folder does not exist or was not selected')
                selectedFolder = ''
              }
            } else {
              // Use zenity on Linux
              const command = new Deno.Command('zenity', {
                args: ['--file-selection', '--directory', '--title=Select Output Folder'],
              })
              const { stdout } = await command.output()
              selectedFolder = new TextDecoder().decode(stdout).trim()
            }
          } catch (error) {
            console.error('Error using native dialog:', error)
            // Fall back to the current directory if dialog fails
            selectedFolder = Deno.cwd()
          }
        } else if (Deno.build.os === 'windows') {
          // For Windows, use PowerShell
          try {
            const command = new Deno.Command('powershell', {
              args: [
                '-Command',
                `Add-Type -AssemblyName System.Windows.Forms; $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog; $folderBrowser.Description = 'Select Output Folder'; $folderBrowser.ShowDialog() | Out-Null; $folderBrowser.SelectedPath`,
              ],
            })
            const { stdout } = await command.output()
            selectedFolder = new TextDecoder().decode(stdout).trim()
          } catch (error) {
            console.error('Error using native dialog:', error)
            // Fall back to the current directory if dialog fails
            selectedFolder = Deno.cwd()
          }
        } else {
          // Fall back to current directory for unsupported OS
          selectedFolder = Deno.cwd()
        }

        // If a folder was selected, add it to the list
        if (selectedFolder && await exists(selectedFolder)) {
          if (!this.outputFolders.includes(selectedFolder)) {
            this.outputFolders.unshift(selectedFolder)
          }

          // Return the selected folder
          return new Response(
            JSON.stringify({
              success: true,
              folder: selectedFolder,
              current: selectedFolder,
              folders: this.outputFolders,
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } else {
          // Return the current directory if no folder was selected
          return new Response(
            JSON.stringify({
              success: false,
              error: 'No folder selected',
              current: Deno.cwd(),
              folders: this.outputFolders,
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      } catch (error) {
        console.error('Error selecting folder:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            current: Deno.cwd(),
            folders: this.outputFolders,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    }

    if (path === '/api/setOutputFolder' && request.method === 'POST') {
      try {
        const data = await request.json()
        const { folder } = data

        // Validate folder exists
        if (await exists(folder)) {
          // Add to the list if not already there
          if (!this.outputFolders.includes(folder)) {
            this.outputFolders.unshift(folder)
          }

          // Make sure the app's output directory is updated
          if (this.app) {
            // Update the app's output directory
            await this.app.updateOutputDir(folder)
            console.log(`Updated app output directory to: ${folder}`)
          }

          return new Response(JSON.stringify({ success: true, folder }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Folder does not exist',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 400,
            },
          )
        }
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: String(error),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      }
    }

    if (path === '/api/getAvailableLanguages') {
      const languages = [
        'hy', // Armenian (default)
        'ru', // Russian
        'en', // English
      ]
      return new Response(JSON.stringify(languages), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (path === '/api/getLanguageName') {
      const params = new URLSearchParams(url.search)
      const code = params.get('code') || 'hy'

      const languageMap: Record<string, string> = {
        'hy': 'Armenian',
        'ru': 'Russian',
        'en': 'English',
      }

      return new Response(JSON.stringify({ name: languageMap[code] || code }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (path === '/api/transcribeAudio' && request.method === 'POST') {
      try {
        const data = await request.json()
        const { filePath, options } = data

        // Check if file exists
        if (!(await exists(filePath))) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `File not found: ${filePath}`,
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        // Ensure app is initialized
        if (!(await this.initializeApp())) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to initialize transcription service',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        // Update app configuration
        this.app.updateConfig({
          languageCode: options.languageCode,
          apiKey: options.apiKey,
          modelId: options.model,
          // Add other config options as needed
        })

        // Get the Downloads folder as the default output location
        let outputFolder = options.outputFolder
        if (!outputFolder) {
          const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE')
          if (homeDir) {
            const downloadsPath = join(homeDir, 'Downloads')
            if (await exists(downloadsPath)) {
              outputFolder = downloadsPath
            }
          }

          // Fallback to current directory if Downloads not found
          if (!outputFolder) {
            outputFolder = Deno.cwd()
          }
        }

        // Run transcription with fixed 30s chunk duration
        console.log(
          `Transcribing ${filePath} with chunk duration 30s to ${outputFolder}`,
        )

        // Call the actual transcription process
        const result = await this.app.run(filePath, outputFolder)

        return new Response(
          JSON.stringify({
            success: result.success,
            result: result.data,
            outputPath: result.outputPath,
            error: result.error,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (error) {
        console.error('Error transcribing audio:', error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      }
    }

    if (path === '/api/getDefaultFolder') {
      // Always use Downloads folder as default
      let defaultFolder = Deno.cwd() // Fallback

      try {
        const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE')
        if (homeDir) {
          const downloadsPath = join(homeDir, 'Downloads')
          if (await exists(downloadsPath)) {
            defaultFolder = downloadsPath

            // Also update the app's output directory
            if (this.app) {
              await this.app.updateOutputDir(downloadsPath)
              console.log(`Set default output directory to Downloads: ${downloadsPath}`)
            }
          }
        }
      } catch (error) {
        console.error('Error getting Downloads folder:', error)
      }

      return new Response(
        JSON.stringify({
          folder: defaultFolder,
          success: true,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Serve static files
    try {
      const uiPath = this.getUIPath()
      let filePath = join(uiPath, path === '/' ? 'index.html' : path)

      // Check if file exists
      if (!(await exists(filePath)) && !filePath.includes('.')) {
        // Try adding .html extension
        filePath += '.html'
        if (!(await exists(filePath))) {
          return new Response('Not Found', { status: 404 })
        }
      }

      // Read file
      const file = await Deno.readFile(filePath)

      // Set content type based on file extension
      const contentType = this.getContentType(filePath)

      return new Response(file, {
        headers: { 'Content-Type': contentType },
      })
    } catch (error) {
      console.error('Error serving file:', error)
      return new Response('Not Found', { status: 404 })
    }
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase() || ''

    const contentTypes: Record<string, string> = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
    }

    return contentTypes[extension] || 'text/plain'
  }

  /**
   * Clean up resources when shutting down
   */
  private async cleanup(): Promise<void> {
    if (this.isShuttingDown) {
      return // Prevent multiple cleanup calls
    }

    this.isShuttingDown = true
    console.log('Cleaning up resources...')

    try {
      // Clean up temp files
      const tempFiles = []
      try {
        for await (const entry of Deno.readDir(this.tempDir)) {
          if (entry.isFile) {
            tempFiles.push(join(this.tempDir, entry.name))
          }
        }
      } catch (error) {
        console.error('Error reading temp directory:', error)
      }

      // Delete temp files
      for (const file of tempFiles) {
        try {
          await Deno.remove(file)
          console.log(`Removed temp file: ${file}`)
        } catch (error) {
          console.error(`Error removing temp file ${file}:`, error)
        }
      }

      console.log('Cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  /**
   * Run the UI application
   */
  public async run(): Promise<void> {
    try {
      // Initialize the transcription app
      await this.initializeApp()

      // Start the web server
      const port = 8000
      console.log(`Starting web server on http://localhost:${port}`)

      // Create an abort controller for the server
      const abortController = new AbortController()
      const { signal } = abortController

      // Serve HTTP requests
      this.server = serve((request) => this.handleRequest(request), { port, signal })

      console.log(`Server running. Open http://localhost:${port} in your browser`)

      // Create a promise that resolves when the server is stopped
      return new Promise((resolve) => {
        // Add a signal handler to resolve the promise when the process is terminated
        const handleSignal = async () => {
          console.log('Shutting down server...')
          abortController.abort()
          await this.cleanup()
          resolve()
          // Remove the signal handlers
          Deno.removeSignalListener('SIGINT', handleSignal)
          Deno.removeSignalListener('SIGTERM', handleSignal)
        }

        // Add signal listeners for graceful shutdown
        Deno.addSignalListener('SIGINT', handleSignal)
        Deno.addSignalListener('SIGTERM', handleSignal)

        // Add an unload event listener to handle browser closing
        if (typeof self !== 'undefined' && 'addEventListener' in self) {
          self.addEventListener('unload', async () => {
            console.log('Browser closed, shutting down server...')
            abortController.abort()
            await this.cleanup()
            resolve()
          })
        }

        console.log('Press Ctrl+C to stop the server')
      })
    } catch (error) {
      console.error('Error running UI:', error)
      throw error // Re-throw the error to be handled by the caller
    }
  }
}

// Run the UI application if this is the main module
if (import.meta.main) {
  const ui = TranscriberUI.getInstance()
  await ui.run()
}
