/* * */

import { type GtfsValidationOutputSummary, GtfsValidationOutputSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, constants, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

/* * */

const BINARY_NAMES: Partial<Record<`${NodeJS.Platform}-${string}`, string>> = {
	'darwin-arm64': 'validator-darwin-arm64',
	'darwin-x64': 'validator-darwin-amd64',
	'linux-arm64': 'validator-linux-arm64',
	'linux-x64': 'validator-linux-amd64',
	'win32-x64': 'validator.exe',
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
	const configuredPath = process.env.GTFS_VALIDATOR_BIN_PATH;
	if (configuredPath) {
		await assertExecutable(configuredPath);
		return configuredPath;
	}

	const platformKey = `${process.platform}-${process.arch}` as const;
	const binaryName = BINARY_NAMES[platformKey];
	if (!binaryName) {
		throw new Error(`Unsupported validator platform: ${platformKey}`);
	}

	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	return findExecutableBinary(binaryName, [process.cwd(), currentDirectory]);
}

async function assertExecutable(binaryPath: string): Promise<void> {
	try {
		await access(binaryPath, constants.F_OK | constants.X_OK);
	} catch (error) {
		throw new Error(`Validator binary not found or not executable: ${binaryPath}`, { cause: error });
	}
}

async function findExecutableBinary(binaryName: string, startDirectories: string[]): Promise<string> {
	const checkedPaths = new Set<string>();

	for (const startDirectory of startDirectories) {
		let currentDirectory = resolve(startDirectory);

		while (dirname(currentDirectory) !== currentDirectory) {
			const candidatePath = resolve(currentDirectory, 'bin', binaryName);

			if (!checkedPaths.has(candidatePath)) {
				checkedPaths.add(candidatePath);

				try {
					await access(candidatePath, constants.F_OK | constants.X_OK);
					return candidatePath;
				} catch {
					// Continue searching parent directories.
				}
			}

			currentDirectory = dirname(currentDirectory);
		}
	}

	throw new Error(`Validator binary ${binaryName} not found or not executable. Checked: ${[...checkedPaths].join(', ')}`);
}

async function runValidatorProcess(binaryPath: string, args: string[], timeout: number): Promise<void> {
	await new Promise<void>((resolvePromise, rejectPromise) => {
		const validatorProcess = spawn(binaryPath, args, {
			env: process.env,
			stdio: ['ignore', 'inherit', 'inherit'],
			windowsHide: true,
		});

		let timedOut = false;
		let forceKillTimer: NodeJS.Timeout | undefined;

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

			if (timedOut) {
				rejectPromise(new Error(`GTFS validation timed out after ${timeout}ms`));
				return;
			}
			if (signal) {
				rejectPromise(new Error(`GTFS validator terminated by signal ${signal}`));
				return;
			}
			if (exitCode !== 0) {
				rejectPromise(new Error(`GTFS validator exited with code ${exitCode ?? 'unknown'}`));
				return;
			}

			resolvePromise();
		});
	});
}
