import { FORCE_KILL_DELAY_MS } from '@/consts/timeout.js';
import { spawn } from 'child_process';

/**
 * Runs the validator process with the given binary path and arguments.
 * @param binaryPath - Path to the validator binary.
 * @param args - Arguments for the validator.
 * @param timeout - Timeout for the validator.
 * @returns A promise that resolves when the validator process completes.
 */
export async function runValidatorProcess(binaryPath: string, args: string[], timeout: number): Promise<void> {
	await new Promise<void>((resolvePromise, rejectPromise) => {
		const validatorProcess = spawn(binaryPath, args);

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
