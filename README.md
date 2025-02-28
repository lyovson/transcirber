# Transcriber

A modern, user-friendly audio transcription application built with Deno.

## Features

- Transcribe audio files to text using ElevenLabs API
- Split audio into manageable chunks for better transcription accuracy
- Customize language, model, and output location
- Modern dark mode UI with intuitive controls
- Export transcriptions in various formats (TXT, SRT, VTT)
- Support for local and cloud-based transcription models
- API key configuration through the UI settings
- Modular architecture for better maintainability

## Requirements

- [Deno](https://deno.land/) v1.37.0 or higher
- FFmpeg (for audio splitting)
- ElevenLabs API key (can be configured in the UI)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/transcriber.git
   cd transcriber
   ```

2. Install FFmpeg if you don't have it already:
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use Chocolatey: `choco install ffmpeg`

3. Create a `.env` file in the project root (optional):
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   INPUT_DIR=./inputs
   OUTPUT_DIR=./outputs
   LANGUAGE_CODE=hy
   CHUNK_DURATION=30
   ```

## Usage

### Using Deno Tasks

The application provides several convenient tasks for running different versions:

```bash
# Run the default application (CLI mode)
deno task start

# Run the UI version
deno task start:ui

# Run the CLI version explicitly
deno task start:cli

# Development mode with file watching (auto-reload on changes)
deno task dev        # Default mode
deno task dev:ui     # UI mode with auto-reload
deno task dev:cli    # CLI mode with auto-reload
```

### Command Line Interface

Run the application with a specific audio file:

```bash
deno run --allow-read --allow-write --allow-net --allow-env --allow-run --env-file=.env main.ts path/to/your/audio-file.mp3
```

### Graphical User Interface

Run the application with the UI:

```bash
deno run --allow-read --allow-write --allow-net --allow-env --allow-run --env-file=.env main.ts --ui
```

Then open your browser to `http://localhost:8000` to access the application.

## API Key Configuration

You can configure your ElevenLabs API key in two ways:

1. **Environment Variable**: Set the `ELEVENLABS_API_KEY` in your `.env` file or system environment variables.
2. **UI Settings**: Click the settings icon in the application and enter your API key in the settings modal.

## Development

### Project Structure

```
transcriber/
├── main.ts                 # Entry point
├── src/
│   ├── app/                # Application logic
│   │   ├── index.ts        # Main application class
│   │   ├── cli/            # CLI application
│   │   └── ui/             # UI application backend
│   ├── services/           # Core services
│   │   ├── audio-splitter/ # Audio splitting service
│   │   ├── file/           # File operations
│   │   └── transcription/  # Transcription service
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # UI components
│   │   ├── index.html      # Main HTML file
│   │   ├── styles/         # CSS styles
│   │   └── scripts/        # JavaScript modules
│   │       ├── bridge.js           # Backend communication
│   │       ├── dom-elements.js     # DOM element references
│   │       ├── event-handlers.js   # Event listeners
│   │       ├── export.js           # Export functionality
│   │       ├── file-processing.js  # File handling
│   │       ├── main.js             # Main entry point
│   │       ├── settings.js         # Settings management
│   │       ├── state.js            # Application state
│   │       ├── transcription.js    # Transcription logic
│   │       └── ui-utils.js         # UI utilities
│   └── utils/              # Utility functions
└── static/                 # Static assets
    ├── fonts/              # Font files
    └── icons/              # Icon files
```

### Frontend Architecture

The frontend code is organized into modular ES modules:

- **main.js**: Application initialization and setup
- **bridge.js**: Communication with the backend API
- **dom-elements.js**: Centralized DOM element references
- **event-handlers.js**: Event listener setup and handling
- **export.js**: Transcription export functionality
- **file-processing.js**: File upload and processing
- **settings.js**: User settings management
- **state.js**: Application state management
- **transcription.js**: Transcription process handling
- **ui-utils.js**: UI helper functions

### Running Tests

```bash
deno task test
```

### Formatting and Linting

```bash
deno task fmt
deno task lint
```

### Building Executables

You can build standalone executables for different platforms:

```bash
# Build for all platforms
deno task build

# Build for specific platforms
deno task build:macos      # macOS (Intel)
deno task build:macos-arm  # macOS (Apple Silicon)
deno task build:windows    # Windows
deno task build:linux      # Linux
```

## License

MIT
