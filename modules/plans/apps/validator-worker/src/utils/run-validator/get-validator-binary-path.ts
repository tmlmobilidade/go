import { BINARY_NAMES } from '@/consts/binaries.js';
import { Logger } from '@tmlmobilidade/logger';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findExecutable } from './find-executable.js';

/**
 * Gets the path to the validator binary for the current platform.
 *
 * @returns The path to the validator binary.
 */
export async function getValidatorBinaryPath(): Promise<string> {
	// Node and Go use different architecture names for x64/amd64, so resolve the
	// exact build artifact through the explicit mapping.
	const platformKey = `${process.platform}-${process.arch}` as const;
	const binaryName = BINARY_NAMES[platformKey];
	if (!binaryName) {
		throw new Error(`Unsupported validator platform: ${platformKey}`);
	}

	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	Logger.info({ message: `currentDirectory: ${currentDirectory}` });

	// Both local development and the container place generated binaries above
	// the compiled worker directory; search from the shared ancestor.
	return findExecutable(process.cwd() + '/../../', binaryName);
}
