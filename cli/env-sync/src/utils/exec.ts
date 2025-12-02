import { exec as execCallback, spawn } from 'child_process';
import { promisify } from 'util';

import { logger } from './logger.js';

const exec = promisify(execCallback);

export interface ExecOptions {
	cwd?: string
	env?: NodeJS.ProcessEnv
	timeout?: number
}

export interface ExecResult {
	stderr: string
	stdout: string
}

export async function execCommand(
	command: string,
	options: ExecOptions = {},
): Promise<ExecResult> {
	// Mask sensitive information in verbose output
	const maskedCommand = command.replace(/--password=([^\s]+)/g, '--password=***');
	logger.verbose(`Executing: ${maskedCommand}`);

	try {
		const result = await exec(command, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			timeout: options.timeout || 0,
		});

		if (logger.isVerbose()) {
			if (result.stdout) {
				logger.verbose(`Stdout: ${result.stdout.toString().trim()}`);
			}
			if (result.stderr) {
				logger.verbose(`Stderr: ${result.stderr.toString().trim()}`);
			}
		}

		return {
			stderr: result.stderr.toString(),
			stdout: result.stdout.toString(),
		};
	}
	catch (error: unknown) {
		const execError = error as { code?: number, stderr?: string, stdout?: string };
		throw new Error(
			`Command failed: ${command}\nExit code: ${execError.code || 'unknown'}\nStderr: ${execError.stderr || 'none'}\nStdout: ${execError.stdout || 'none'}`,
		);
	}
}

export async function execCommandStream(
	command: string,
	options: ExecOptions = {},
): Promise<void> {
	return new Promise((resolve, reject) => {
		// Mask sensitive information in verbose output
		const maskedCommand = command.replace(/--password=([^\s]+)/g, '--password=***');
		logger.verbose(`Executing: ${maskedCommand}`);

		// Parse command properly handling quoted strings
		// This avoids the deprecation warning from using shell: true with arguments
		const parts: string[] = [];
		let current = '';
		let inQuotes = false;
		let quoteChar = '';
		let escaped = false;

		for (const char of command) {
			if (escaped) {
				current += char;
				escaped = false;
				continue;
			}

			if (char === '\\') {
				escaped = true;
				continue;
			}

			if ((char === '"' || char === '\'') && !escaped) {
				if (!inQuotes) {
					inQuotes = true;
					quoteChar = char;
				}
				else if (char === quoteChar) {
					inQuotes = false;
					quoteChar = '';
				}
				else {
					current += char;
				}
			}
			else if (char === ' ' && !inQuotes) {
				if (current) {
					parts.push(current);
					current = '';
				}
			}
			else {
				current += char;
			}
		}

		if (current) {
			parts.push(current);
		}

		if (parts.length === 0) {
			reject(new Error(`Invalid command: ${command}`));
			return;
		}

		const cmd = parts[0];
		const args = parts.slice(1);

		const childProcess = spawn(cmd, args, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			shell: false,
			stdio: 'inherit', // This allows rclone's progress output to be displayed in real-time
		});

		childProcess.on('close', (code) => {
			if (code === 0) {
				resolve();
			}
			else {
				reject(new Error(`Command failed with exit code ${code}: ${command}`));
			}
		});

		childProcess.on('error', (error) => {
			reject(new Error(`Command failed: ${command}\nError: ${error.message}`));
		});
	});
}

export async function checkCommandAvailable(command: string): Promise<boolean> {
	try {
		await execCommand(`which ${command}`);
		return true;
	}
	catch {
		return false;
	}
}
