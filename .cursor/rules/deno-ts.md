---
Description: General TypeScript and Deno standards for Transcriber project
Globs:
  - '**/*.ts'
  - '**/*.tsx'
---

# Guidelines

## TypeScript Best Practices

- Use strict TypeScript with `type` definitions over interfaces—leverage union types and utility types like `Pick`, `Omit`, `Partial` for complex types
- Return errors as values with discriminated unions (e.g., `type Result<T, E> = { ok: true, data: T } | { ok: false, error: E }`)
- Enforce immutability with `readonly` properties and `as const` assertions
- Use explicit function return types for public APIs
- Prefer type inference for internal implementation details
- Leverage TypeScript's structural typing for flexible, composable code

## Deno Development

- Use Deno's standard library when possible instead of third-party dependencies
- Leverage top-level `await` for cleaner async code
- Use explicit permissions with least privilege (e.g., `--allow-read=./inputs`)
- Implement proper error handling with descriptive messages
- Use Deno's built-in testing framework with comprehensive test coverage
- Leverage Deno's native TypeScript support without transpilation

## Code Structure

- Name files in kebab-case (e.g., `audio-processor.ts`, `transcription-service.ts`)
- Keep files <100 lines, refactoring if complex
- Organize code into logical modules with clear responsibilities
- Use pure functions where possible for better testability
- Implement proper error handling with descriptive messages
- Make sure everything is typed strictly by TypeScript

## Documentation

- Let TypeScript types serve as the primary documentation for parameters and return values
- Add concise comments only for complex logic that isn't self-explanatory
- Focus on documenting "why" (design decisions) rather than "what" (which should be clear from the code)
- Use single-line comments for function/method descriptions
- Avoid redundant JSDoc annotations when TypeScript types already provide the information
- Document public APIs with clear usage examples for complex functionality

## Functional Programming

- Prefer immutable data structures and pure functions
- Use function composition over inheritance
- Leverage higher-order functions for reusable logic
- Handle errors functionally rather than with exceptions
- Use optional chaining and nullish coalescing for safer code

## Performance Considerations

- Implement proper resource cleanup for file operations
- Use streaming APIs for large file processing
- Implement proper error handling with graceful degradation
- Consider memory usage when processing large audio files
- Use async iterators for efficient data processing
