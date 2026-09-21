/* eslint-disable @typescript-eslint/naming-convention */

import { chmodSync, copyFileSync, createWriteStream, existsSync, mkdirSync } from 'node:fs';
import path, { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Lookup table for all platforms and binary distribution files.
 */
const BINARY_DISTRIBUTIONS_FILES: Record<string, string> = {
	'darwin-arm64': 'validator-darwin-arm64',
	'darwin-x64': 'validator-darwin-amd64',
	'linux-arm64': 'validator-linux-arm64',
	'linux-x64': 'validator-linux-amd64',
	'win32-x64': 'validator.exe',
	'windows-x64': 'validator.exe', // Alias for win32-x64
} as const;

const DEV_BIN_PATH = join(__dirname, '..', '..', 'bin');
const LOCAL_BIN_PATH = join(__dirname, '..', 'bin');

/**
 * Resolves the URL to download the binary from.
 *
 * Pins to the exact package version when available (via npm_package_version
 * set by npm during lifecycle scripts), otherwise falls back to the latest
 * GitHub release.
 */
function getRemoteBinPath(): string {
	const version = process.env.npm_package_version;
	if (version) {
		return `https://github.com/tmlmobilidade/validator/releases/download/${version}/`;
	}
	return 'https://github.com/tmlmobilidade/validator/releases/latest/download/';
}

/**
 * Gets the current platform identifier.
 *
 * @returns Platform identifier string
 */
function getCurrentPlatform(): string {
	const platform = process.platform;
	const arch = process.arch;
	// Normalize win32 to windows for consistency
	const normalizedPlatform = platform === 'win32' ? 'windows' : platform;
	return `${normalizedPlatform}-${arch}`;
}

/**
 * Builds the development environment by copying binaries from the dev bin path.
 *
 * @throws {Error} If the binary file is not found or copy fails
 */
function buildDevEnvironment(): void {
	const platform = getCurrentPlatform();
	const binaryDistributionFile = BINARY_DISTRIBUTIONS_FILES[platform];

	if (!binaryDistributionFile) {
		throw new Error(`No binary distribution file found for platform: ${platform}`);
	}

	const sourcePath = join(DEV_BIN_PATH, binaryDistributionFile);
	if (!existsSync(sourcePath)) {
		throw new Error(`Source binary not found: ${sourcePath}`);
	}

	// Create local bin path if it doesn't exist
	if (!existsSync(LOCAL_BIN_PATH)) {
		mkdirSync(LOCAL_BIN_PATH, { recursive: true });
	}

	const destPath = join(LOCAL_BIN_PATH, binaryDistributionFile);
	copyFileSync(sourcePath, destPath);

	// Make executable on Unix-like systems
	if (process.platform !== 'win32') {
		chmodSync(destPath, 0o755);
	}
}

/**
 * Downloads the binary from the remote server.
 *
 * @throws {Error} If download fails or platform is not supported
 */
async function downloadRemoteBinaries(): Promise<void> {
	const platform = getCurrentPlatform();
	const binaryDistributionFile = BINARY_DISTRIBUTIONS_FILES[platform];

	if (!binaryDistributionFile) {
		throw new Error(`No binary distribution file found for platform: ${platform}`);
	}

	const remoteUrl = getRemoteBinPath() + binaryDistributionFile;
	let res: Response;

	try {
		res = await fetch(remoteUrl);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to fetch remote binary from ${remoteUrl}: ${errorMessage}`);
	}

	if (!res.ok) {
		throw new Error(`Error downloading remote binary from ${remoteUrl}: ${res.status} ${res.statusText}`);
	}

	// Create the local bin path if it doesn't exist
	if (!existsSync(LOCAL_BIN_PATH)) {
		mkdirSync(LOCAL_BIN_PATH, { recursive: true });
	}

	// Download the file
	const arrayBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// Create the file stream
	const destPath = path.resolve(LOCAL_BIN_PATH, binaryDistributionFile);
	const fileStream = createWriteStream(destPath);

	// Write the file to the local bin path
	await finished(Readable.from(buffer).pipe(fileStream));

	// Make executable on Unix-like systems
	if (process.platform !== 'win32') {
		chmodSync(destPath, 0o755);
	}
}

/**
 * Main function to set up the validator binary.
 */
async function main(): Promise<void> {
	const platform = getCurrentPlatform();
	const binaryDistributionFile = BINARY_DISTRIBUTIONS_FILES[platform];

	if (!binaryDistributionFile) {
		console.error(`No binary distribution file found for platform: ${platform}`);
		process.exitCode = 1;
		return;
	}

	const binaryDistributionFilePath = join(DEV_BIN_PATH, binaryDistributionFile);

	// Check if the file exists locally (development environment)
	if (existsSync(binaryDistributionFilePath)) {
		try {
			buildDevEnvironment();
			console.log(`✓ Binary copied from dev environment: ${binaryDistributionFile}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`✗ Error building dev environment: ${errorMessage}`);
			process.exitCode = 1;
		}
	} else {
		console.info(`Local file not found: ${binaryDistributionFilePath}`);
		console.info(`Downloading binary from ${getRemoteBinPath()}...`);

		try {
			await downloadRemoteBinaries();
			console.log(`✓ Binary downloaded successfully: ${binaryDistributionFile}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`✗ Error downloading remote binary: ${errorMessage}`);
			process.exitCode = 1;
		}
	}
}

// Run main function and handle errors
main().catch((error) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	console.error(`✗ Unexpected error: ${errorMessage}`);
	process.exitCode = 1;
});
