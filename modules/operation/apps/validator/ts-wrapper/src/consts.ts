import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/* * */

export const BINARY_DISTRIBUTIONS = {
	'darwin-arm64': 'validator-darwin-arm64',
	'darwin-x64': 'validator-darwin-amd64',
	'linux-arm64': 'validator-linux-arm64',
	'linux-x64': 'validator-linux-amd64',
	'win32-x64': 'validator.exe',
} as const;

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = dirname(currentFilename);

/** Matches postinstall output: `<package>/bin` (i.e. `dist/bin` when published). */
export const LOCAL_BIN_PATH = resolve(currentDirname, '..', 'bin');

/**
 * Default timeout for validation operations (30 minutes).
 */
export const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
