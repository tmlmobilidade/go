/* eslint-disable @typescript-eslint/naming-convention */

import type { GtfsValidationResult, GtfsValidatorOptions } from './interfaces/index.js';
import type { SupportedPlatform } from './types/index.js';
import type { GtfsValidationOutputSummary } from '@tmlmobilidade/go-types-gtfs-validator';

import { GoBinaryError, runGoBinary, type RunGoBinaryOptions } from '@/utils.js';
import { access, constants, readFile } from 'fs/promises';
import { resolve } from 'path';

import { buildValidatorArgs } from './buildValidatorArgs.js';
import { BINARY_DISTRIBUTIONS, DEFAULT_TIMEOUT_MS, LOCAL_BIN_PATH } from './consts.js';
import { GtfsValidationError } from './errors/index.js';
import { getCurrentPlatform } from './getCurrentPlatform.js';
import { getValidatorBinaryPath } from './getValidatorBinaryPath.js';
import { validateInput } from './validateInput.js';
import { validateOptions } from './validateOptions.js';

export { GtfsValidationError } from './errors/index.js';
export type { GtfsValidationResult, GtfsValidatorOptions } from './interfaces/index.js';
export type { SupportedLanguage, SupportedPlatform } from './types/index.js';

/**
 * Runs the GTFS validator on the specified input.
 *
 * @param input Path to the GTFS feed (file or directory)
 * @param options Validation options
 * @returns Promise resolving to validation results
 *
 * @example
 * ```ts
 * try {
 *   const result = await GTFSValidator('./gtfs-feed.zip', {
 *     lang: 'en',
 *     timeout: 300000, // 5 minutes
 *     out_file: './validation-report.json'
 *   });
 *
 *   console.log(`Validation completed in ${result.executionTime}ms`);
 *   console.log(`Found ${result.summary.errorCount} errors`);
 * } catch (err) {
 *   if (err instanceof GTFSValidatorError) {
 *     console.error(`Validation failed: ${err.message}`);
 *   }
 * }
 * ```
 */
/**
 * Runs the GTFS validator on the specified input.
 *
 * @param input - Path to the GTFS feed (file or directory)
 * @param options - Validation options
 * @returns Promise resolving to validation results
 *
 * @throws {GtfsValidationError} If validation fails or input is invalid
 *
 * @example
 * ```ts
 * try {
 *   const result = await GTFSValidator('./gtfs-feed.zip', {
 *     lang: 'en',
 *     timeout: 300000, // 5 minutes
 *     out_file: './validation-report.json'
 *   });
 *
 *   console.log(`Validation completed in ${result.executionTime}ms`);
 *   console.log(`Found ${result.summary.errorCount} errors`);
 * } catch (err) {
 *   if (err instanceof GtfsValidationError) {
 *     console.error(`Validation failed: ${err.message}`);
 *     console.error(`Error code: ${err.code}`);
 *   }
 * }
 * ```
 */
export async function GtfsValidator(input: string, options: GtfsValidatorOptions = {}): Promise<GtfsValidationResult> {
	//
	// Validate and normalize options
	const validatedOptions = validateOptions(options);
	const {
		cwd,
		env,
		timeout = DEFAULT_TIMEOUT_MS,
		...validatorOptions
	} = validatedOptions;

	try {
		// Validate input
		await validateInput(input);

		// Get binary path
		const binaryPath = await getValidatorBinaryPath();

		// Build arguments
		const args = buildValidatorArgs(input, validatorOptions);

		// Determine output file path (resolve relative to cwd if provided)
		const outputFilePath = validatorOptions.out_file
			? resolve(cwd || process.cwd(), validatorOptions.out_file)
			: undefined;

		// Run validator
		const runOptions: RunGoBinaryOptions = {
			args,
			cwd,
			env,
			maxStderrSize: 5 * 1024 * 1024, // 5MB for error messages
			maxStdoutSize: 50 * 1024 * 1024, // 50MB for large validation reports
			timeout,
		};

		const startTime = Date.now();
		let result: Awaited<ReturnType<typeof runGoBinary<GtfsValidationOutputSummary>>>;
		let summary: GtfsValidationOutputSummary;

		try {
			result = await runGoBinary<GtfsValidationOutputSummary>(binaryPath, runOptions);
			summary = result.data;
		} catch (err) {
			// If output file was specified and we got a JSON parse error or no output,
			// try reading from the file instead (the validator writes to file, not stdout)
			if (
				outputFilePath
				&& err instanceof GoBinaryError
				&& (err.code === 'NO_OUTPUT' || err.code === 'JSON_PARSE_ERROR' || err.code === 'NO_VALID_LINES')
			) {
				try {
					// Wait a bit for the file to be written (in case of race condition)
					await new Promise(resolve => setTimeout(resolve, 100));
					const fileContent = await readFile(outputFilePath, 'utf-8');
					summary = JSON.parse(fileContent.trim()) as GtfsValidationOutputSummary;
					// Calculate execution time from when we started
					const executionTime = Date.now() - startTime;
					// Create a result object with the file data, preserving error info for stderr/stdout
					result = {
						data: summary,
						executionTime,
						exitCode: err.exitCode ?? 0,
						stderr: err.stderr || '',
						stdout: err.stdout || '',
					};
				} catch (fileErr) {
					const error = fileErr instanceof Error ? fileErr : new Error(String(fileErr));
					throw new GtfsValidationError(
						`Failed to read or parse output file: ${outputFilePath}. ${error.message}`,
						'OUTPUT_FILE_READ_ERROR',
						error,
						err.stdout,
						err.stderr,
					);
				}
			} else {
				// Re-throw the original error
				throw err;
			}
		}

		return {
			args,
			executionTime: result.executionTime,
			stderr: result.stderr,
			stdout: result.stdout,
			summary,
		};
	} catch (err) {
		// Re-throw GTFSValidatorError as-is
		if (err instanceof GtfsValidationError) {
			throw err;
		}

		// Convert GoBinaryError to GTFSValidatorError with context
		if (err instanceof GoBinaryError) {
			let errorMessage = `GTFS validation failed: ${err.message}`;
			let errorCode = 'VALIDATION_FAILED';

			// Provide more specific error messages based on the binary error
			switch (err.code) {
				case 'JSON_PARSE_ERROR':
					errorMessage = 'Failed to parse validation results. The validator may have crashed or produced invalid output.';
					errorCode = 'PARSE_ERROR';
					break;
				case 'NON_ZERO_EXIT':
					errorMessage = `GTFS validator exited with error code ${err.exitCode ?? 'unknown'}${err.stderr ? `: ${err.stderr}` : ''}`;
					errorCode = 'VALIDATOR_ERROR';
					break;
				case 'STDERR_TOO_LARGE':
					errorMessage = 'Validation error output exceeded maximum size.';
					errorCode = 'ERROR_OUTPUT_TOO_LARGE';
					break;
				case 'STDOUT_TOO_LARGE':
					errorMessage = 'Validation output exceeded maximum size. The GTFS feed may be too large.';
					errorCode = 'OUTPUT_TOO_LARGE';
					break;
				case 'TIMEOUT':
					errorMessage = `GTFS validation timed out after ${timeout}ms. Consider increasing the timeout for large feeds.`;
					errorCode = 'VALIDATION_TIMEOUT';
					break;
			}

			throw new GtfsValidationError(
				errorMessage,
				errorCode,
				err,
				err.stdout,
				err.stderr,
			);
		}

		// Handle unexpected errors
		const errorMessage = err instanceof Error ? err.message : String(err);
		throw new GtfsValidationError(
			`Unexpected error during GTFS validation: ${errorMessage}`,
			'UNEXPECTED_ERROR',
			err instanceof Error ? err : new Error(String(err)),
		);
	}
}

/**
 * Gets information about the available validator binary for the current platform.
 *
 * @returns Information about the validator binary including availability status
 *
 * @example
 * ```ts
 * const info = await getValidatorInfo();
 * if (info.isAvailable) {
 *   console.log(`Binary found at: ${info.binaryPath}`);
 * } else {
 *   console.log(`Binary not found for platform: ${info.platform}`);
 * }
 * ```
 */
export async function getValidatorInfo(): Promise<{ binaryName: string, binaryPath: string, isAvailable: boolean, platform: SupportedPlatform }> {
	const platform = getCurrentPlatform();
	const binaryName = BINARY_DISTRIBUTIONS[platform];
	const binaryPath = resolve(LOCAL_BIN_PATH, binaryName);

	let isAvailable = false;
	try {
		await access(binaryPath, constants.F_OK | constants.X_OK);
		isAvailable = true;
	} catch {
		// Binary not available - this is expected in some scenarios
	}

	return {
		binaryName,
		binaryPath,
		isAvailable,
		platform,
	};
}
