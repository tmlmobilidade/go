import type { GoBinaryResult, RunGoBinaryOptions } from './interfaces/index.js';

import { ChildProcess, spawn } from 'child_process';
import { access, constants } from 'fs/promises';
import path from 'path';

import { GoBinaryError } from './errors/index.js';

export { GoBinaryError } from './errors/index.js';
export type { GoBinaryResult, RunGoBinaryOptions } from './interfaces/index.js';

/**
 * Runs a Go binary and returns its JSON stdout as an object.
 *
 * @param binaryPath Absolute or relative path to the Go binary
 * @param options Configuration options
 * @returns A promise that resolves to a structured result with parsed JSON data
 *
 * @example
 * ```ts
 * const result = await runGoBinary<{status: string}>('./my-binary', {
 *   args: ['--config', 'prod.json'],
 *   timeout: 30000
 * });
 * console.log(result.data.status);
 * ```
 */
/**
 * Default buffer sizes and timeout constants.
 */
const DEFAULT_MAX_STDERR_SIZE = 1024 * 1024; // 1MB
const DEFAULT_MAX_STDOUT_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_TIMEOUT_MS = 1000 * 60 * 60 * 24; // 24 hours
const FORCE_KILL_DELAY_MS = 1000 * 60; // 1 minute

export async function runGoBinary<T = unknown>(binaryPath: string, options: RunGoBinaryOptions = {}): Promise<GoBinaryResult<T>> {
	//

	//
	// Validate options

	const {
		args = [],
		cwd = process.cwd(),
		env = {},
		forwardOutput = true,
		maxStderrSize = DEFAULT_MAX_STDERR_SIZE,
		maxStdoutSize = DEFAULT_MAX_STDOUT_SIZE,
		timeout = DEFAULT_TIMEOUT_MS,
	} = options;

	//
	// Validate binary exists and is executable

	const fullPath = path.resolve(binaryPath);
	try {
		await access(fullPath, constants.F_OK | constants.X_OK);
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		throw new GoBinaryError(
			`Binary not found or not executable: ${fullPath}`,
			'BINARY_NOT_FOUND',
			undefined,
			undefined,
			error.message,
		);
	}

	//
	// Run the binary

	return new Promise<GoBinaryResult<T>>((resolve, reject) => {
		const startTime = Date.now();
		let proc: ChildProcess;
		let timedOut = false;
		let stdoutSize = 0;
		let stderrSize = 0;

		const stdoutChunks: Buffer[] = [];
		const stderrChunks: Buffer[] = [];

		const cleanup = () => {
			if (timer) {
				clearTimeout(timer);
			}
			if (proc && !proc.killed) {
				try {
					proc.kill('SIGTERM');
					// Force kill after delay if still running
					setTimeout(() => {
						if (proc && !proc.killed) {
							try {
								proc.kill('SIGKILL');
							} catch {
								// Ignore errors during force kill
							}
						}
					}, FORCE_KILL_DELAY_MS);
				} catch {
					// Ignore errors during cleanup
				}
			}
		};

		//
		// Set up timeout

		const timer = setTimeout(() => {
			timedOut = true;
			cleanup();
			reject(new GoBinaryError(
				`Process timed out after ${timeout}ms`,
				'TIMEOUT',
			));
		}, timeout);

		//
		// Spawn the process

		try {
			proc = spawn(fullPath, args, {
				cwd,
				env: { ...process.env, ...env },
				stdio: ['ignore', 'pipe', 'pipe'],
				windowsHide: true, // Hide console window on Windows
			});
		} catch (err) {
			cleanup();
			reject(new GoBinaryError(
				`Failed to spawn process: ${err instanceof Error ? err.message : String(err)}`,
				'SPAWN_ERROR',
			));
			return;
		}

		//
		// Handle stdout

		proc.stdout?.on('data', (chunk: Buffer) => {
			stdoutSize += chunk.length;
			if (stdoutSize > maxStdoutSize) {
				cleanup();
				reject(new GoBinaryError(
					`Stdout buffer exceeded maximum size of ${maxStdoutSize} bytes`,
					'STDOUT_TOO_LARGE',
				));
				return;
			}
			stdoutChunks.push(chunk);
			// Forward to parent process stdout if enabled
			if (forwardOutput) {
				process.stdout.write(chunk);
			}
		});

		//
		// Handle stderr

		proc.stderr?.on('data', (chunk: Buffer) => {
			stderrSize += chunk.length;
			if (stderrSize > maxStderrSize) {
				cleanup();
				reject(new GoBinaryError(
					`Stderr buffer exceeded maximum size of ${maxStderrSize} bytes`,
					'STDERR_TOO_LARGE',
				));
				return;
			}
			stderrChunks.push(chunk);
			// Forward to parent process stderr if enabled
			if (forwardOutput) {
				process.stderr.write(chunk);
			}
		});

		//
		// Handle process error

		proc.on('error', (err: Error) => {
			cleanup();
			reject(new GoBinaryError(
				`Process error: ${err.message}`,
				'PROCESS_ERROR',
			));
		});

		//
		// Handle process close

		proc.on('close', (code: null | number, signal: NodeJS.Signals | null) => {
			const executionTime = Date.now() - startTime;
			const stdout = Buffer.concat(stdoutChunks).toString('utf-8').trim();
			const stderr = Buffer.concat(stderrChunks).toString('utf-8').trim();
			const exitCode = code ?? -1;

			//
			// Cleanup

			try {
				cleanup();

				if (timedOut) return; // Timeout already handled

				// Handle termination by signal
				if (signal) {
					reject(new GoBinaryError(
						`Process terminated by signal ${signal}`,
						'TERMINATED_BY_SIGNAL',
						exitCode,
						stdout,
						stderr,
					));
					return;
				}

				// Handle non-zero exit codes
				if (exitCode !== 0) {
					reject(new GoBinaryError(
						`Binary exited with code ${exitCode}${stderr ? `: ${stderr}` : ''}`,
						'NON_ZERO_EXIT',
						exitCode,
						stdout,
						stderr,
					));
					return;
				}

				// Handle empty output
				if (!stdout) {
					reject(new GoBinaryError(
						'Binary produced no stdout output',
						'NO_OUTPUT',
						exitCode,
						stdout,
						stderr,
					));
					return;
				}

				// Parse JSON from the last non-empty line
				const lines = stdout.split('\n').map((line: string) => line.trim()).filter(Boolean);
				if (lines.length === 0) {
					reject(new GoBinaryError(
						'No valid output lines found',
						'NO_VALID_LINES',
						exitCode,
						stdout,
						stderr,
					));
					return;
				}

				const lastLine = lines[lines.length - 1];
				let parsedData: T;

				try {
					parsedData = JSON.parse(lastLine) as T;
				} catch (parseErr) {
					reject(new GoBinaryError(
						`Failed to parse JSON from output: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
						'JSON_PARSE_ERROR',
						exitCode,
						stdout,
						stderr,
					));
					return;
				}

				resolve({
					data: parsedData,
					executionTime,
					exitCode,
					stderr,
					stdout,
				});
			} catch (err) {
				cleanup();
				const errorMessage = err instanceof Error ? err.message : String(err);
				reject(new GoBinaryError(
					`Unexpected error in close handler: ${errorMessage}`,
					'UNEXPECTED_ERROR',
					exitCode,
					stdout,
					stderr,
				));
			}
		});
	});
}
