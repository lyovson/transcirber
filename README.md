# Audio Transcriber

A simple tool to transcribe audio files using the ElevenLabs API, built with Deno and TypeScript.

## Features

- Transcribe audio files in multiple formats (MP3, WAV, M4A, OGG, FLAC)
- Armenian language transcription support
- Batch processing of multiple files
- Combined output in markdown format
- Type-safe implementation with TypeScript
- Functional programming approach with immutability
- Modular architecture for maintainability

## Setup

1. Make sure you have [Deno](https://deno.com/) installed (v2.0+ recommended)
2. No need to install dependencies - Deno handles them automatically
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
   This will automatically load environment variables from your `.env` file.
3. Transcribed text files will be saved in the `outputs` folder:
   - Individual transcriptions with the same filename but with a `.txt` extension
   - A combined file named `combined_transcription.txt` containing all transcriptions

## Project Structure

The project follows a modular architecture:

```
├── src/
│   ├── app.ts                 # Main application class
│   ├── services/
│   │   ├── file-service.ts    # File operations service
│   │   └── transcription-service.ts # Transcription service
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
├── LICENSE                    # MIT License
├── CHANGELOG.md               # Project changelog
└── .env                       # Environment variables (not committed)
```

## Development

This project uses Deno's built-in tools:

- **Linting**: `deno task lint`
- **Formatting**: `deno task fmt`
- **Testing**: `deno task test`

### Environment Variables

The application uses Deno's built-in environment variable handling:

- Environment variables are loaded from the `.env` file using the `--env-file` flag
- The `setupEnv` utility function ensures all variables are properly set
- All tasks in `deno.json` are configured to use the `.env` file automatically

### Git Setup

The project includes:

- A comprehensive `.gitignore` file to exclude sensitive and generated files
- GitHub Actions workflow for continuous integration
- `.env.example` template for required environment variables

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
3. Verify that the audio files are not corrupted or empty
4. Run with `--log-level=debug` for more detailed logs:
   ```
   deno run --allow-read --allow-write --allow-net --allow-env --log-level=debug main.ts
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
