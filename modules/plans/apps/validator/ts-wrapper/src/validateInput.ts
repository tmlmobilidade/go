import { access, constants } from 'fs/promises';
import { resolve } from 'path';

import { GtfsValidationError } from './errors/index.js';

/**
 * Validates input parameters before running the validator.
 *
 * @param input - The input path to validate
 * @throws {GtfsValidationError} If the input is invalid or not accessible
 *
 * @internal
 */
export async function validateInput(input: string): Promise<void> {
	if (typeof input !== 'string' || input.trim().length === 0) {
		throw new GtfsValidationError(
			'Input path is required and must be a non-empty string',
			'INVALID_INPUT',
		);
	}

	try {
		const inputPath = resolve(input);
		await access(inputPath, constants.F_OK | constants.R_OK);
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		throw new GtfsValidationError(
			`Input path does not exist or is not readable: ${input}`,
			'INPUT_NOT_ACCESSIBLE',
			error,
		);
	}
}
