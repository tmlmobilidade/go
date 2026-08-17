/* * */

import { type GtfsValidationOutputSummary, GtfsValidationOutputSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

/* * */

const BINARY_NAMES: Partial<Record<`${NodeJS.Platform}-${string}`, string>> = {
	'darwin-arm64': 'validator-darwin-arm64',
	'darwin-x64': 'validator-darwin-amd64',
	'linux-arm64': 'validator-linux-arm64',
	'linux-x64': 'validator-linux-amd64',
};

const FORCE_KILL_DELAY_MS = 60_000;
const execFileAsync = promisify(execFile);

interface ProjectValidatorOptions {
	lang: 'en' | 'pt'
	log_level: 'debug' | 'error' | 'info'
	out_file: string
	rules_path: string
	timeout: number
}

/**
 * Runs the project validator on the given input file.
 * @param inputPath - Path to the input GTFS file.
 * @param options - Options for the validator.
 * @returns The validation output summary.
 */
export async function runProjectValidator(inputPath: string, options: ProjectValidatorOptions): Promise<GtfsValidationOutputSummary> {
	const binaryPath = await getProjectValidatorBinaryPath();
	const binaryContent = await readFile(binaryPath);
	const { stdout: versionOutput } = await execFileAsync(binaryPath, ['-version'], {
		encoding: 'utf-8',
		env: process.env,
		windowsHide: true,
	});

	console.log('GTFS validator runtime:', {
		binary_path: binaryPath,
		sha256: createHash('sha256').update(binaryContent).digest('hex'),
		version: versionOutput.trim(),
	});

	const args = [
		'-input', inputPath,
		'-out', options.out_file,
		'-rules', options.rules_path,
		'-lang', options.lang,
		'-log', options.log_level,
	];

	await runValidatorProcess(binaryPath, args, options.timeout);

	const resultContent = await readFile(options.out_file, 'utf8');
	return GtfsValidationOutputSummarySchema.parse(JSON.parse(resultContent));
}

export async function getProjectValidatorBinaryPath(): Promise<string> {
	const platformKey = `${process.platform}-${process.arch}` as const;
	const binaryName = BINARY_NAMES[platformKey];
	if (!binaryName) {
		throw new Error(`Unsupported validator platform: ${platformKey}`);
	}

	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	console.log('currentDirectory', currentDirectory);
	console.log('process.cwd()', process.cwd());

	return findExecutable(process.cwd() + '/../../', binaryName);
	// return findExecutableBinary(binaryName, [process.cwd() + '/../../apps/validator']);
}

/**
 * Recursively searches for an executable/file by name
 * inside the given directory and all its child directories.
 *
 * @returns Full path to the executable, or null if not found.
 */
export function findExecutable(rootPath: string, executableName: string): null | string {
	const entries = readdirSync(rootPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(rootPath, entry.name);

		if (entry.isFile() && entry.name === executableName) {
			return fullPath;
		}

		if (entry.isDirectory()) {
			const result = findExecutable(fullPath, executableName);

			if (result) {
				return result;
			}
		}
	}

	return null;
}

async function runValidatorProcess(binaryPath: string, args: string[], timeout: number): Promise<void> {
	await new Promise<void>((resolvePromise, rejectPromise) => {
		const validatorProcess = spawn(binaryPath, args, {
			env: process.env,
			stdio: ['ignore', 'inherit', 'pipe'],
			windowsHide: true,
		});

		const stderrChunks: Buffer[] = [];
		let timedOut = false;
		let forceKillTimer: NodeJS.Timeout | undefined;

		validatorProcess.stderr?.on('data', (chunk: Buffer) => {
			stderrChunks.push(chunk);
			process.stderr.write(chunk);
		});

		const timeoutTimer = setTimeout(() => {
			timedOut = true;
			validatorProcess.kill('SIGTERM');
			forceKillTimer = setTimeout(() => validatorProcess.kill('SIGKILL'), FORCE_KILL_DELAY_MS);
		}, timeout);

		const cleanup = () => {
			clearTimeout(timeoutTimer);
			if (forceKillTimer) clearTimeout(forceKillTimer);
		};

		validatorProcess.once('error', (error) => {
			cleanup();
			rejectPromise(new Error(`Failed to start GTFS validator: ${error.message}`, { cause: error }));
		});

		validatorProcess.once('close', (exitCode, signal) => {
			cleanup();
			const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

			if (timedOut) {
				rejectPromise(new Error(`GTFS validation timed out after ${timeout}ms`));
				return;
			}
			if (signal) {
				rejectPromise(new Error(`GTFS validator terminated by signal ${signal}`));
				return;
			}
			if (exitCode !== 0) {
				rejectPromise(new Error(`GTFS validator exited with code ${exitCode ?? 'unknown'}${stderr ? `: ${stderr}` : ''}`));
				return;
			}

			resolvePromise();
		});
	});
}
