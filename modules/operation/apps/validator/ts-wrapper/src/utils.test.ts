import { type ChildProcess, spawn } from 'child_process';
import { access } from 'fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GoBinaryError, runGoBinary } from './utils.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
	access: vi.fn(),
	constants: {
		F_OK: 1,
		X_OK: 2,
	},
}));

// Mock child_process
vi.mock('child_process', () => ({
	spawn: vi.fn(),
}));

describe('runGoBinary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('unit - binary validation', () => {
		it('should throw GoBinaryError when binary does not exist', async () => {
			vi.mocked(access).mockRejectedValue(new Error('File not found'));

			await expect(runGoBinary('/nonexistent/binary')).rejects.toThrow(GoBinaryError);
			await expect(runGoBinary('/nonexistent/binary')).rejects.toThrow('Binary not found or not executable');
		});

		it('should throw GoBinaryError when binary is not executable', async () => {
			vi.mocked(access).mockRejectedValue(new Error('Permission denied'));

			await expect(runGoBinary('/non-executable/binary')).rejects.toThrow(GoBinaryError);
			await expect(runGoBinary('/non-executable/binary')).rejects.toThrow('Binary not found or not executable');
		});

		it('should pass validation when binary exists and is executable', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			// Start the promise but don't await it yet
			const promise = runGoBinary('/valid/binary');

			// Simulate successful execution
			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"result": "success"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;
			expect(result.data).toEqual({ result: 'success' });
			expect(result.exitCode).toBe(0);
		});
	});

	describe('unit - process execution', () => {
		it('should spawn process with correct arguments', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary', {
				args: ['--flag', 'value'],
				cwd: '/working/dir',
				env: { TEST_VAR: 'test' },
			});

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"result": "ok"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			await promise;

			expect(spawn).toHaveBeenCalledWith(
				expect.stringContaining('/binary'),
				['--flag', 'value'],
				expect.objectContaining({
					cwd: '/working/dir',
					env: expect.objectContaining({ TEST_VAR: 'test' }),
				}),
			);
		});

		it('should parse JSON from last non-empty line', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('Some log output\n'));
				mockProcess.stdout?.emit('data', Buffer.from('More logs\n'));
				mockProcess.stdout?.emit('data', Buffer.from('{"final": "result"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;
			expect(result.data).toEqual({ final: 'result' });
		});

		it('should handle multiple JSON lines and use the last one', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"first": "line"}\n'));
				mockProcess.stdout?.emit('data', Buffer.from('{"second": "line"}\n'));
				mockProcess.stdout?.emit('data', Buffer.from('{"third": "line"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;
			expect(result.data).toEqual({ third: 'line' });
		});
	});

	describe('unit - error handling', () => {
		it('should throw GoBinaryError on non-zero exit code', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stderr?.emit('data', Buffer.from('Error occurred\n'));
				mockProcess.emit('close', 1, null);
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('NON_ZERO_EXIT');
			}
		});

		it('should throw GoBinaryError on empty stdout', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.emit('close', 0, null);
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('NO_OUTPUT');
			}
		});

		it('should throw GoBinaryError on invalid JSON', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('not valid json\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('JSON_PARSE_ERROR');
			}
		});

		it('should throw GoBinaryError on timeout', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary', { timeout: 50 });

			// Don't emit close event, let it timeout
			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('TIMEOUT');
			}
		});

		it('should throw GoBinaryError when stdout exceeds max size', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary', { maxStdoutSize: 100 });

			setTimeout(() => {
				// Emit data larger than maxStdoutSize
				const buffer = Buffer.alloc(150, 'a');
				mockProcess.stdout?.emit('data', buffer);
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('STDOUT_TOO_LARGE');
			}
		});

		it('should throw GoBinaryError when stderr exceeds max size', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary', { maxStderrSize: 100 });

			setTimeout(() => {
				// Emit data larger than maxStderrSize
				const buffer = Buffer.alloc(150, 'a');
				mockProcess.stderr?.emit('data', buffer);
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('STDERR_TOO_LARGE');
			}
		});

		it('should throw GoBinaryError on process error', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.emit('error', new Error('Process error'));
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('PROCESS_ERROR');
			}
		});

		it('should throw GoBinaryError when terminated by signal', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.emit('close', null, 'SIGTERM');
			}, 10);

			await expect(promise).rejects.toThrow(GoBinaryError);
			try {
				await promise;
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('TERMINATED_BY_SIGNAL');
			}
		});

		it('should throw GoBinaryError on spawn failure', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			vi.mocked(spawn).mockImplementation(() => {
				throw new Error('Spawn failed');
			});

			await expect(runGoBinary('/binary')).rejects.toThrow(GoBinaryError);
			try {
				await runGoBinary('/binary');
			} catch (err) {
				expect((err as GoBinaryError).code).toBe('SPAWN_ERROR');
			}
		});
	});

	describe('unit - result structure', () => {
		it('should return correct result structure', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"test": "data"}\n'));
				mockProcess.stderr?.emit('data', Buffer.from('warning message\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;

			expect(result).toHaveProperty('data');
			expect(result).toHaveProperty('executionTime');
			expect(result).toHaveProperty('exitCode');
			expect(result).toHaveProperty('stdout');
			expect(result).toHaveProperty('stderr');
			expect(result.data).toEqual({ test: 'data' });
			expect(result.exitCode).toBe(0);
			expect(result.stderr).toBe('warning message');
			expect(typeof result.executionTime).toBe('number');
			expect(result.executionTime).toBeGreaterThan(0);
		});

		it('should calculate execution time correctly', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			const startTime = Date.now();
			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"done": true}\n'));
				mockProcess.emit('close', 0, null);
			}, 50);

			const result = await promise;
			const endTime = Date.now();

			expect(result.executionTime).toBeGreaterThanOrEqual(50);
			expect(result.executionTime).toBeLessThanOrEqual(endTime - startTime + 10); // Allow some margin
		});
	});

	describe('unit - default options', () => {
		it('should use default timeout when not specified', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			// Verify timeout is set (we can't easily test the exact value, but we can verify it doesn't fail immediately)
			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"result": "ok"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;
			expect(result.data).toEqual({ result: 'ok' });
		});

		it('should use default buffer sizes when not specified', async () => {
			vi.mocked(access).mockResolvedValue(undefined);
			const mockProcess = createMockProcess();
			vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess);

			const promise = runGoBinary('/binary');

			setTimeout(() => {
				mockProcess.stdout?.emit('data', Buffer.from('{"result": "ok"}\n'));
				mockProcess.emit('close', 0, null);
			}, 10);

			const result = await promise;
			expect(result.data).toEqual({ result: 'ok' });
		});
	});
});

describe('GoBinaryError', () => {
	it('unit - should create error with correct properties', () => {
		const error = new GoBinaryError(
			'Test error',
			'TEST_CODE',
			1,
			'stdout content',
			'stderr content',
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(GoBinaryError);
		expect(error.message).toBe('Test error');
		expect(error.code).toBe('TEST_CODE');
		expect(error.exitCode).toBe(1);
		expect(error.stdout).toBe('stdout content');
		expect(error.stderr).toBe('stderr content');
		expect(error.name).toBe('GoBinaryError');
	});

	it('unit - should handle optional properties', () => {
		const error = new GoBinaryError('Test error', 'TEST_CODE');

		expect(error.exitCode).toBeUndefined();
		expect(error.stdout).toBeUndefined();
		expect(error.stderr).toBeUndefined();
	});
});

/**
 * Helper function to create a mock ChildProcess
 */
function createMockProcess() {
	const mockProcess = {
		_closeCallback: null as ((code: null | number, signal: NodeJS.Signals | null) => void) | null,
		_errorCallback: null as ((...args: unknown[]) => void) | null,
		emit: vi.fn((event: string, ...args: unknown[]) => {
			if (event === 'error' && mockProcess._errorCallback) {
				mockProcess._errorCallback(args[0]);
			}
			if (event === 'close' && mockProcess._closeCallback) {
				mockProcess._closeCallback(args[0] as null | number, args[1] as NodeJS.Signals | null);
			}
		}),
		kill: vi.fn(() => {
			mockProcess.killed = true;
		}),
		killed: false,
		on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
			if (event === 'error') {
				mockProcess._errorCallback = callback;
			}
			if (event === 'close') {
				mockProcess._closeCallback = callback;
			}
		}),
		stderr: {
			_dataCallback: null as ((data: Buffer) => void) | null,
			emit: vi.fn((event: string, data?: Buffer) => {
				if (event === 'data' && mockProcess.stderr._dataCallback) {
					mockProcess.stderr._dataCallback(data ?? Buffer.alloc(0));
				}
			}),
			on: vi.fn((event: string, callback: (data: Buffer) => void) => {
				if (event === 'data') {
					mockProcess.stderr._dataCallback = callback;
				}
			}),
		},
		stdout: {
			_dataCallback: null as ((data: Buffer) => void) | null,
			emit: vi.fn((event: string, data?: Buffer) => {
				if (event === 'data' && mockProcess.stdout._dataCallback) {
					mockProcess.stdout._dataCallback(data ?? Buffer.alloc(0));
				}
			}),
			on: vi.fn((event: string, callback: (data: Buffer) => void) => {
				if (event === 'data') {
					mockProcess.stdout._dataCallback = callback;
				}
			}),
		},
	};

	return mockProcess;
}
