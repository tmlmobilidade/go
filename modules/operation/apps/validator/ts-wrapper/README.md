# GTFS Validator TypeScript Wrapper

A TypeScript wrapper for the GTFS Validator binary, providing a clean and type-safe API for validating GTFS feeds.

## Features

- ✅ **Type-safe API** - Full TypeScript support with comprehensive type definitions
- ✅ **Cross-platform** - Supports Windows, macOS (Intel & Apple Silicon), and Linux (x64 & ARM64)
- ✅ **Robust error handling** - Detailed error messages with error codes
- ✅ **Input validation** - Validates inputs before execution
- ✅ **Configurable timeouts** - Customizable timeout for large feeds
- ✅ **Comprehensive documentation** - Full JSDoc documentation

## Installation

```bash
npm install @tmlmobilidade/gtfs-validator
```

## Usage

### Basic Usage

```typescript
import { GTFSValidator } from '@tmlmobilidade/gtfs-validator';

const result = await GTFSValidator('./gtfs-feed.zip', {
  lang: 'en',
  timeout: 300000, // 5 minutes
});

console.log(`Validation completed in ${result.executionTime}ms`);
console.log(`Found ${result.summary.errorCount} errors`);
```

### Advanced Usage

```typescript
import { GTFSValidator, GTFSValidatorError, getValidatorInfo } from '@tmlmobilidade/gtfs-validator';

try {
  // Check if binary is available
  const info = await getValidatorInfo();
  if (!info.isAvailable) {
    console.error(`Binary not found for platform: ${info.platform}`);
    return;
  }

  // Run validation with custom options
  const result = await GTFSValidator('./gtfs-feed.zip', {
    lang: 'pt',
    timeout: 600000, // 10 minutes
    out_file: './validation-report.json',
    rules_path: './custom-rules.json',
    cwd: './working-directory',
    env: {
      CUSTOM_VAR: 'value',
    },
  });

  // Access results
  console.log('Validation Summary:', result.summary);
  console.log('Execution Time:', result.executionTime, 'ms');
  console.log('Arguments:', result.args);
} catch (err) {
  if (err instanceof GTFSValidatorError) {
    console.error(`Validation failed: ${err.message}`);
    console.error(`Error code: ${err.code}`);
    if (err.stderr) {
      console.error('Stderr:', err.stderr);
    }
  } else {
    console.error('Unexpected error:', err);
  }
}
```

## API Reference

### `GTFSValidator(input, options?)`

Runs the GTFS validator on the specified input.

**Parameters:**
- `input` (string): Path to the GTFS feed (file or directory)
- `options` (GTFSValidatorOptions, optional): Validation options

**Returns:** Promise<GTFSValidatorResult>

**Throws:** GTFSValidatorError

### `getValidatorInfo()`

Gets information about the available validator binary for the current platform.

**Returns:** Promise<{ binaryName: string, binaryPath: string, isAvailable: boolean, platform: SupportedPlatform }>

### `GTFSValidatorError`

Error class thrown when validation fails.

**Properties:**
- `message` (string): Error message
- `code` (string): Error code (e.g., 'VALIDATION_FAILED', 'TIMEOUT', 'BINARY_NOT_FOUND')
- `originalError` (Error?, optional): Original error if available
- `stdout` (string?, optional): Standard output from the validator
- `stderr` (string?, optional): Standard error from the validator

## Options

### `GTFSValidatorOptions`

- `cwd?` (string): Working directory for the validation process
- `env?` (Record<string, string>): Additional environment variables
- `lang?` ('en' | 'pt'): Language for validation messages
- `out_file?` (string): Output file path for detailed validation results
- `rules_path?` (string): Path to custom validation rules file
- `timeout?` (number): Timeout in milliseconds (default: 30 minutes)

## Error Codes

- `UNSUPPORTED_PLATFORM`: Current platform is not supported
- `BINARY_NOT_FOUND`: Validator binary not found or not executable
- `INVALID_INPUT`: Input path is invalid
- `INPUT_NOT_ACCESSIBLE`: Input path does not exist or is not readable
- `INVALID_OPTIONS`: Invalid options provided
- `VALIDATION_FAILED`: General validation failure
- `VALIDATOR_ERROR`: Validator exited with non-zero code
- `VALIDATION_TIMEOUT`: Validation timed out
- `PARSE_ERROR`: Failed to parse validation results
- `OUTPUT_TOO_LARGE`: Validation output exceeded maximum size
- `ERROR_OUTPUT_TOO_LARGE`: Validation error output exceeded maximum size
- `UNEXPECTED_ERROR`: Unexpected error occurred

## Supported Platforms

- `darwin-arm64` - macOS (Apple Silicon)
- `darwin-x64` - macOS (Intel)
- `linux-arm64` - Linux (ARM64)
- `linux-x64` - Linux (x64)
- `win32-x64` - Windows (x64)

## License

ISC

-