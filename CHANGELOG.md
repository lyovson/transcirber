# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- API key configuration through UI settings
- Support for passing API key from UI to backend
- Improved error handling for transcription failures
- Debug logging for better troubleshooting

### Changed
- Refactored frontend code to use ES modules
- Improved module organization with separate responsibility areas
- Converted DOM element references to use a centralized object
- Enhanced bridge module with better documentation and organization
- Updated event handlers to use the new DOM elements object
- Improved code readability and maintainability

### Fixed
- Fixed issue with API key not being passed to the transcription service
- Resolved references to undefined functions
- Fixed direct DOM element access in event handlers
- Improved error handling in transcription process

## [0.2.0] - 2024-07-28

### Added
- Initial project setup with Deno 2
- TypeScript implementation of audio transcription functionality
- File service for handling audio files
- Transcription service for processing audio content
- Type definitions for project components
- Environment variable utilities
- Test suite for core functionality
- GitHub Actions workflow for CI/CD
- Project documentation (README, LICENSE, CHANGELOG)

### Changed
- Migrated from JavaScript to TypeScript
- Improved code organization with modular structure
- Enhanced error handling with functional approach
- Updated configuration for Deno 2 compatibility
- Renamed entry point from `transcribe.ts` to `main.ts` following Deno conventions
- Updated task name from `transcribe` to `start` in deno.json

### Fixed
- Removed unsupported compiler options from deno.json
- Added proper permissions for test execution

## [0.1.0] - 2024-07-25

### Added
- Initial project setup with Deno and TypeScript
- Modular architecture with separate services
- Audio file transcription using ElevenLabs API
- Combined output of all transcriptions
- Support for multiple audio formats (MP3, WAV, M4A, OGG, FLAC)
- Armenian language transcription support
- Comprehensive test suite
- GitHub Actions workflow for CI
- Project documentation
