import { BINARY_NAMES } from '@/consts/binaries.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findExecutable } from './find-executable.js';

/**
 * Gets the path to the validator binary for the current platform.
 *
 * @returns The path to the validator binary.
 */
export async function getValidatorBinaryPath(): Promise<string> {
	const platformKey = `${process.platform}-${process.arch}` as const;
	const binaryName = BINARY_NAMES[platformKey];
	if (!binaryName) {
		throw new Error(`Unsupported validator platform: ${platformKey}`);
	}

	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	console.log('currentDirectory', currentDirectory);
	console.log('process.cwd()', process.cwd());

	return findExecutable(process.cwd() + '/../../', binaryName);
}
