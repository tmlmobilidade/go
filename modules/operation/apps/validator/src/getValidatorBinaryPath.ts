import { access, constants } from 'fs/promises';
import { resolve } from 'path';

import { BINARY_DISTRIBUTIONS, LOCAL_BIN_PATH } from './consts.js';
import { GtfsValidationError } from './errors/index.js';
import { getCurrentPlatform } from './getCurrentPlatform.js';

/**
 * Gets the path to the validator binary for the current platform.
 *
 * @returns The absolute path to the validator binary
 * @throws {GtfsValidationError} If the binary is not found or not executable
 *
 * @internal
 */
export async function getValidatorBinaryPath(): Promise<string> {
	const platform = getCurrentPlatform();
	const binaryName = BINARY_DISTRIBUTIONS[platform];
	const binaryPath = resolve(LOCAL_BIN_PATH, binaryName);

	try {
		await access(binaryPath, constants.F_OK | constants.X_OK);
		return binaryPath;
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		throw new GtfsValidationError(
			`GTFS validator binary not found or not executable: ${binaryPath}. Please ensure the binary is installed for platform ${platform}`,
			'BINARY_NOT_FOUND',
			error,
		);
	}
}
