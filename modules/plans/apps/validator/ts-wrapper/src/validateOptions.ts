import type { GtfsValidatorOptions } from './interfaces/index.js';

import { GtfsValidationError } from './errors/index.js';

/**
 * Validates options object and normalizes values.
 *
 * @param options - The options to validate
 * @returns Normalized options
 * @throws {GtfsValidationError} If options are invalid
 *
 * @internal
 */
export function validateOptions(options: GtfsValidatorOptions = {}): GtfsValidatorOptions {
	const { cwd, env, lang, timeout } = options;

	if (timeout !== undefined && (typeof timeout !== 'number' || timeout <= 0 || !Number.isFinite(timeout))) {
		throw new GtfsValidationError(
			'Timeout must be a positive finite number',
			'INVALID_OPTIONS',
		);
	}

	if (lang !== undefined && typeof lang !== 'string') {
		throw new GtfsValidationError(
			'Language must be a string',
			'INVALID_OPTIONS',
		);
	}

	if (options.out_file !== undefined && (typeof options.out_file !== 'string' || options.out_file.trim().length === 0)) {
		throw new GtfsValidationError(
			'Output file path must be a non-empty string',
			'INVALID_OPTIONS',
		);
	}

	if (options.rules_path !== undefined && (typeof options.rules_path !== 'string' || options.rules_path.trim().length === 0)) {
		throw new GtfsValidationError(
			'Rules path must be a non-empty string',
			'INVALID_OPTIONS',
		);
	}

	if (cwd !== undefined && typeof cwd !== 'string') {
		throw new GtfsValidationError(
			'Working directory must be a string',
			'INVALID_OPTIONS',
		);
	}

	if (env !== undefined && (typeof env !== 'object' || env === null || Array.isArray(env))) {
		throw new GtfsValidationError(
			'Environment variables must be an object',
			'INVALID_OPTIONS',
		);
	}

	return options;
}
