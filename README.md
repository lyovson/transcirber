# Audio Transcriber

A simple tool to transcribe audio files using the ElevenLabs API, built with Deno and TypeScript.

## Features

- Transcribe audio files in multiple formats (MP3, WAV, M4A, OGG, FLAC)
- **Automatic splitting of long audio files into 30-second chunks**
- Armenian language transcription support
- Batch processing of multiple files
- Combined output in markdown format
- Type-safe implementation with TypeScript
- Functional programming approach with immutability
- Modular architecture for maintainability

## Requirements

- [Deno](https://deno.com/) v2.0+
- [FFmpeg](https://ffmpeg.org/) installed and available in your PATH
- ElevenLabs API key

## Setup

1. Make sure you have [Deno](https://deno.com/) installed (v2.0+ recommended)
2. Install FFmpeg:
   - **macOS**: `brew install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use [Chocolatey](https://chocolatey.org/): `choco install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian) or `sudo dnf install ffmpeg` (Fedora)
3. Create a `.env` file with your ElevenLabs API key (use `.env.example` as a template):
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```

## Usage

1. Place your audio files in the `inputs` folder
2. Run the transcription script:
   ```
   deno task start
   ```
   This will automatically:
   - Load environment variables from your `.env` file
   - Split audio files into 30-second chunks
   - Transcribe each chunk
   - Combine the transcriptions
3. Transcribed text files will be saved in the `outputs` folder:
   - Individual transcriptions with the same filename but with a `.txt` extension
   - A combined file named `combined_transcription.md` containing all transcriptions

## How It Works

1. The application scans the `inputs` directory for audio files
2. Each audio file is split into 30-second chunks using FFmpeg
3. Each chunk is transcribed using the ElevenLabs API
4. The transcriptions are combined in the correct order
5. Results are saved as individual files and a combined markdown file
6. Temporary files are automatically cleaned up

## Project Structure

The project follows a modular architecture:

```
├── src/
│   ├── app.ts                 # Main application class
│   ├── services/
│   │   ├── file-service/      # File operations service
│   │   │   ├── index.ts
│   │   │   └── test.ts        # File service tests
│   │   ├── transcription/     # Transcription service
│   │   │   ├── index.ts
│   │   │   └── test.ts        # Transcription service tests
│   │   └── audio-splitter/    # Audio splitting service
│   │       ├── index.ts
│   │       └── test.ts        # Audio splitter tests
│   ├── types/
│   │   └── index.ts           # Type definitions
│   └── utils/
│       └── env.ts             # Environment utilities
├── .github/
│   └── workflows/
│   │   └── deno.yml           # GitHub Actions workflow
├── main.ts                    # Entry point
├── main.test.ts               # Tests
├── deno.json                  # Deno configuration
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── CHANGELOG.md               # Project changelog
└── .env                       # Environment variables (not committed)
```

## Development

This project uses Deno's built-in tools:

- **Linting**: `deno task lint`
- **Formatting**: `deno task fmt`
- **Testing**: `deno task test`

### Testing

The project includes comprehensive tests for all services:

- **Unit Tests**: Each service has its own test file
  - `src/services/file-service/test.ts`
  - `src/services/transcription/test.ts`
  - `src/services/audio-splitter/test.ts`
- **Integration Tests**: `main.test.ts` tests the application as a whole

Run all tests with:

```bash
deno task test
```

Or run specific tests:

```bash
deno test src/services/file-service/test.ts
```

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)
- FLAC (.flac)

## API Integration

The project uses the ElevenLabs API for audio transcription. The integration is handled through the `TranscriptionService` class, which:

1. Prepares audio files for transcription
2. Sends requests to the ElevenLabs API
3. Processes and formats the transcription results
4. Handles errors and edge cases

## Error Handling

The project implements a functional approach to error handling:

- Errors are treated as values rather than exceptions
- Functions return result objects with success/error states
- Clear error messages for troubleshooting
- Graceful degradation when possible

## Troubleshooting

If you encounter any issues:

1. Ensure your ElevenLabs API key is valid and has sufficient credits
2. Check that your audio files are in a supported format
3. Verify that FFmpeg is installed and available in your PATH
4. Verify that the audio files are not corrupted or empty
5. Run with `--log-level=debug` for more detailed logs:
   ```
   deno run --allow-read --allow-write --allow-net --allow-env --allow-run --env-file=.env --log-level=debug main.ts
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
