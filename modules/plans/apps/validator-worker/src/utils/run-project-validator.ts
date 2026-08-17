/* * */

import { type GtfsValidationOutputSummary, GtfsValidationOutputSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

import { getValidatorBinaryPath } from './run-validator/get-validator-binary-path.js';

/* * */

const FORCE_KILL_DELAY_MS = 60_000; // 1 minute
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
	const binaryPath = await getValidatorBinaryPath();
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
