# Transcriber

A modern, user-friendly audio transcription application built with Deno.

## Features

- Transcribe audio files to text
- Split audio into manageable chunks for better transcription accuracy
- Customize language, chunk size, and output location
- Modern dark mode UI
- Export transcriptions in various formats (TXT, SRT, VTT)
- Support for local and cloud-based transcription models

## Requirements

- [Deno](https://deno.land/) v1.37.0 or higher
- FFmpeg (for audio splitting)

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
   INPUT_DIR=./inputs
   OUTPUT_DIR=./outputs
   LANGUAGE_CODE=en
   CHUNK_DURATION=120
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

## Development

### Project Structure

```
transcriber/
├── main.ts                 # Entry point
├── src/
│   ├── app.ts              # Main application logic
│   ├── cli-app.ts          # CLI application
│   ├── ui-app.ts           # UI application
│   ├── services/           # Core services
│   │   ├── audio-splitter/ # Audio splitting service
│   │   ├── file-service/   # File operations
│   │   └── transcription/  # Transcription service
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # UI components
│   │   ├── index.html      # Main HTML file
│   │   ├── styles/         # CSS styles
│   │   └── scripts/        # JavaScript files
│   └── utils/              # Utility functions
└── static/                 # Static assets
    ├── fonts/              # Font files
    └── icons/              # Icon files
```

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
