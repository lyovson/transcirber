# Project Description

- This app takes an audio file (like .mp3) and transcribes it to text file (.md).
- Since the API seems to be handle 30s of audio at a time this app should be able to cut the file onto a 30s-long chunks, transcribe those and then cobine the transcribet text into a single file.
- This project uses Deno and Typescript, Elevenlabs API for transcription and ffmpeg for working with audio files.
