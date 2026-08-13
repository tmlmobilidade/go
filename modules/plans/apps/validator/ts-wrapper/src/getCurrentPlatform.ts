import type { SupportedPlatform } from './types/index.js';

import { BINARY_DISTRIBUTIONS } from './consts.js';
import { GtfsValidationError } from './errors/index.js';

/**
 * Gets the current platform identifier in the format expected by the binary distributions.
 *
 * @returns The platform key matching the current system
 * @throws {GtfsValidationError} If the platform is not supported
 *
 * @internal
 */
export function getCurrentPlatform(): SupportedPlatform {
	const platform = process.platform;
	const arch = process.arch;
	const platformKey = `${platform}-${arch}` as SupportedPlatform;

	if (!(platformKey in BINARY_DISTRIBUTIONS)) {
		const supportedPlatforms = Object.keys(BINARY_DISTRIBUTIONS).join(', ');
		throw new GtfsValidationError(
			`Unsupported platform: ${platformKey}. Supported platforms: ${supportedPlatforms}`,
			'UNSUPPORTED_PLATFORM',
		);
	}

	return platformKey;
}
