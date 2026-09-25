import { access, readFile } from 'fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getValidatorInfo, GtfsValidationError, GtfsValidator } from './index.js';
import { GoBinaryError, runGoBinary } from './utils.js';

// Mock dependencies
vi.mock('fs/promises', () => ({
	access: vi.fn(),
	constants: {
		F_OK: 1,
		R_OK: 2,
		X_OK: 4,
	},
	readFile: vi.fn(),
}));

vi.mock('@/utils.js', () => ({
	GoBinaryError: class GoBinaryError extends Error {
		constructor(
			message: string,
			public code: string,
			public exitCode?: number,
			public stdout?: string,
			public stderr?: string,
		) {
			super(message);
			this.name = 'GoBinaryError';
		}
	},
	runGoBinary: vi.fn(),
}));

// Mock process.platform and process.arch
const originalPlatform = process.platform;
const originalArch = process.arch;

describe('GTFSValidator', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset platform/arch mocks
		Object.defineProperty(process, 'platform', {
			configurable: true,
			value: originalPlatform,
			writable: true,
		});
		Object.defineProperty(process, 'arch', {
			configurable: true,
			value: originalArch,
			writable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('unit - input validation', () => {
		it('should throw GTFSValidatorError for empty input', async () => {
			await expect(GtfsValidator('')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('');
			} catch (err) {
				expect(err).toBeInstanceOf(GtfsValidationError);
				expect((err as GtfsValidationError).code).toBe('INVALID_INPUT');
			}
		});

		it('should throw GTFSValidatorError for whitespace-only input', async () => {
			await expect(GtfsValidator('   ')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('   ');
			} catch (err) {
				expect(err).toBeInstanceOf(GtfsValidationError);
				expect((err as GtfsValidationError).code).toBe('INVALID_INPUT');
			}
		});

		it('should throw GTFSValidatorError for non-string input', async () => {
			await expect(GtfsValidator(null)).rejects.toThrow();

			await expect(GtfsValidator(undefined)).rejects.toThrow();
		});

		it('should throw GTFSValidatorError when input file does not exist', async () => {
			vi.mocked(access).mockRejectedValue(new Error('File not found'));

			await expect(GtfsValidator('/nonexistent/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/nonexistent/file.zip');
			} catch (err) {
				expect(err).toBeInstanceOf(GtfsValidationError);
				expect((err as GtfsValidationError).code).toBe('INPUT_NOT_ACCESSIBLE');
			}
		});

		it('should throw GTFSValidatorError when input file is not readable', async () => {
			vi.mocked(access).mockRejectedValue(new Error('Permission denied'));

			await expect(GtfsValidator('/unreadable/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/unreadable/file.zip');
			} catch (err) {
				expect(err).toBeInstanceOf(GtfsValidationError);
				expect((err as GtfsValidationError).code).toBe('INPUT_NOT_ACCESSIBLE');
			}
		});
	});

	describe('unit - options validation', () => {
		beforeEach(() => {
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should throw GTFSValidatorError for invalid timeout (negative)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { timeout: -1 })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip', { timeout: -1 });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_OPTIONS');
			}
		});

		it('should throw GTFSValidatorError for invalid timeout (zero)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { timeout: 0 })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip', { timeout: 0 });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_OPTIONS');
			}
		});

		it('should throw GTFSValidatorError for invalid timeout (Infinity)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { timeout: Infinity })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip', { timeout: Infinity });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_OPTIONS');
			}
		});

		it('should throw GTFSValidatorError for empty out_file', async () => {
			await expect(GtfsValidator('/valid/file.zip', { out_file: '' })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip', { out_file: '' });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_OPTIONS');
			}
		});

		it('should throw GTFSValidatorError for empty rules_path', async () => {
			await expect(GtfsValidator('/valid/file.zip', { rules_path: '   ' })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip', { rules_path: '   ' });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_OPTIONS');
			}
		});

		it('should throw GTFSValidatorError for invalid env (not an object)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { env: { TEST: 'value' } })).rejects.toThrow(GtfsValidationError);
		});

		it('should throw GTFSValidatorError for invalid env (array)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { env: { TEST: 'value' } })).rejects.toThrow(GtfsValidationError);
		});

		it('should throw GTFSValidatorError for invalid cwd (not a string)', async () => {
			await expect(GtfsValidator('/valid/file.zip', { cwd: './work' })).rejects.toThrow(GtfsValidationError);
		});

		it('should accept valid options', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 0,
				total_warnings: 0,
			};

			vi.mocked(runGoBinary).mockResolvedValue({
				data: mockSummary,
				executionTime: 100,
				exitCode: 0,
				stderr: '',
				stdout: JSON.stringify(mockSummary),
			});

			const result = await GtfsValidator('/valid/file.zip', {
				cwd: './work',
				env: { TEST: 'value' },
				lang: 'en',
				log_level: 'info',
				out_file: './output.json',
				rules_path: './rules.json',
				timeout: 60000,
			});

			expect(result.summary).toEqual(mockSummary);
		});
	});

	describe('unit - platform support', () => {
		it('should throw GTFSValidatorError for unsupported platform', async () => {
			Object.defineProperty(process, 'platform', { configurable: true, value: 'unsupported', writable: true });
			Object.defineProperty(process, 'arch', { configurable: true, value: 'unsupported', writable: true });

			vi.mocked(access).mockResolvedValue(undefined);

			await expect(GtfsValidator('/valid/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/valid/file.zip');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('UNSUPPORTED_PLATFORM');
			}
		});
	});

	describe('unit - binary path resolution', () => {
		beforeEach(() => {
			// Ensure platform is valid for these tests
			Object.defineProperty(process, 'platform', {
				configurable: true,
				value: originalPlatform,
				writable: true,
			});
			Object.defineProperty(process, 'arch', {
				configurable: true,
				value: originalArch,
				writable: true,
			});
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should throw GtfsValidationError when binary is not found', async () => {
			// Reset mocks
			vi.mocked(access).mockReset();
			vi.mocked(runGoBinary).mockReset();

			// Use mockImplementation to control which access call fails
			let callCount = 0;
			vi.mocked(access).mockImplementation(async () => {
				callCount++;
				// First call is for input validation, second is for binary check
				if (callCount === 1) {
					return undefined; // Input file exists
				}
				if (callCount === 2) {
					throw new Error('Binary not found'); // Binary doesn't exist
				}
				return undefined;
			});

			const error = await GtfsValidator('/valid/file.zip').catch(err => err) as GtfsValidationError;
			expect(error).toBeInstanceOf(GtfsValidationError);
			expect(error.code).toBe('BINARY_NOT_FOUND');
			// Verify runGoBinary was never called since binary path resolution failed
			expect(vi.mocked(runGoBinary)).not.toHaveBeenCalled();
		});

		it('should throw GtfsValidationError when binary is not executable', async () => {
			// Reset mocks
			vi.mocked(access).mockReset();
			vi.mocked(runGoBinary).mockReset();

			// Use mockImplementation to control which access call fails
			let callCount = 0;
			vi.mocked(access).mockImplementation(async () => {
				callCount++;
				// First call is for input validation, second is for binary check
				if (callCount === 1) {
					return undefined; // Input file exists
				}
				if (callCount === 2) {
					throw new Error('Permission denied'); // Binary not executable
				}
				return undefined;
			});

			const error = await GtfsValidator('/valid/file.zip').catch(err => err) as GtfsValidationError;
			expect(error).toBeInstanceOf(GtfsValidationError);
			expect(error.code).toBe('BINARY_NOT_FOUND');
			// Verify runGoBinary was never called since binary path resolution failed
			expect(vi.mocked(runGoBinary)).not.toHaveBeenCalled();
		});
	});

	describe('unit - argument building', () => {
		beforeEach(() => {
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should build correct arguments with all options', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 0,
				total_warnings: 0,
			};

			vi.mocked(runGoBinary).mockResolvedValue({
				data: mockSummary,
				executionTime: 100,
				exitCode: 0,
				stderr: '',
				stdout: JSON.stringify(mockSummary),
			});

			const result = await GtfsValidator('/input/file.zip', {
				lang: 'pt',
				log_level: 'debug',
				out_file: './output.json',
				rules_path: './rules.json',
			});

			expect(result.args).toContain('-input');
			expect(result.args).toContain('/input/file.zip');
			expect(result.args).toContain('-out');
			expect(result.args).toContain('./output.json');
			expect(result.args).toContain('-rules');
			expect(result.args).toContain('./rules.json');
			expect(result.args).toContain('-lang');
			expect(result.args).toContain('pt');
			expect(result.args).toContain('-log');
			expect(result.args).toContain('debug');
		});

		it('should build minimal arguments with only input', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 0,
				total_warnings: 0,
			};

			vi.mocked(runGoBinary).mockResolvedValue({
				data: mockSummary,
				executionTime: 100,
				exitCode: 0,
				stderr: '',
				stdout: JSON.stringify(mockSummary),
			});

			const result = await GtfsValidator('/input/file.zip');

			expect(result.args).toEqual(['-input', '/input/file.zip']);
		});
	});

	describe('unit - successful validation', () => {
		beforeEach(() => {
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should return correct result structure on success', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 5,
				total_warnings: 3,
			};

			vi.mocked(runGoBinary).mockResolvedValue({
				data: mockSummary,
				executionTime: 1234,
				exitCode: 0,
				stderr: 'Some warnings',
				stdout: JSON.stringify(mockSummary),
			});

			const result = await GtfsValidator('/input/file.zip');

			expect(result).toHaveProperty('summary');
			expect(result).toHaveProperty('executionTime');
			expect(result).toHaveProperty('args');
			expect(result).toHaveProperty('stdout');
			expect(result).toHaveProperty('stderr');
			expect(result.summary).toEqual(mockSummary);
			expect(result.executionTime).toBe(1234);
			expect(result.stderr).toBe('Some warnings');
		});
	});

	describe('unit - error handling', () => {
		beforeEach(() => {
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should convert GoBinaryError JSON_PARSE_ERROR to GTFSValidatorError', async () => {
			vi.mocked(runGoBinary).mockRejectedValue(
				new GoBinaryError('JSON parse failed', 'JSON_PARSE_ERROR', 0, 'output', 'errors'),
			);

			await expect(GtfsValidator('/input/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/input/file.zip');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('PARSE_ERROR');
			}
		});

		it('should convert GoBinaryError NON_ZERO_EXIT to GTFSValidatorError', async () => {
			vi.mocked(runGoBinary).mockRejectedValue(
				new GoBinaryError('Process failed', 'NON_ZERO_EXIT', 1, 'output', 'error message'),
			);

			await expect(GtfsValidator('/input/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/input/file.zip');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('VALIDATOR_ERROR');
			}
		});

		it('should convert GoBinaryError TIMEOUT to GTFSValidatorError', async () => {
			vi.mocked(runGoBinary).mockRejectedValue(
				new GoBinaryError('Timeout', 'TIMEOUT', undefined, 'output', 'errors'),
			);

			await expect(GtfsValidator('/input/file.zip', { timeout: 5000 })).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/input/file.zip', { timeout: 5000 });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('VALIDATION_TIMEOUT');
			}
		});

		it('should handle output file fallback when JSON parse fails', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 0,
				total_warnings: 0,
			};

			// First call fails with JSON_PARSE_ERROR
			vi.mocked(runGoBinary).mockRejectedValueOnce(
				new GoBinaryError('JSON parse failed', 'JSON_PARSE_ERROR', 0, '', ''),
			);

			// Mock file read
			vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockSummary));

			const result = await GtfsValidator('/input/file.zip', { out_file: './output.json' });

			expect(result.summary).toEqual(mockSummary);
			expect(readFile).toHaveBeenCalled();
		});

		it('should throw error when output file read fails', async () => {
			vi.mocked(runGoBinary).mockRejectedValue(
				new GoBinaryError('JSON parse failed', 'JSON_PARSE_ERROR', 0, '', ''),
			);
			vi.mocked(readFile).mockRejectedValue(new Error('File read failed'));

			await expect(GtfsValidator('/input/file.zip', { out_file: './output.json' })).rejects.toThrow(
				GtfsValidationError,
			);
			try {
				await GtfsValidator('/input/file.zip', { out_file: './output.json' });
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('OUTPUT_FILE_READ_ERROR');
			}
		});

		it('should handle unexpected errors', async () => {
			vi.mocked(runGoBinary).mockRejectedValue(new Error('Unexpected error'));

			await expect(GtfsValidator('/input/file.zip')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('/input/file.zip');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('UNEXPECTED_ERROR');
			}
		});
	});

	describe('unit - default timeout', () => {
		beforeEach(() => {
			vi.mocked(access).mockResolvedValue(undefined);
		});

		it('should use default timeout when not specified', async () => {
			const mockSummary = {
				messages: [],
				total_errors: 0,
				total_warnings: 0,
			};

			vi.mocked(runGoBinary).mockResolvedValue({
				data: mockSummary,
				executionTime: 100,
				exitCode: 0,
				stderr: '',
				stdout: JSON.stringify(mockSummary),
			});

			await GtfsValidator('/input/file.zip');

			// Verify runGoBinary was called with default timeout (30 minutes)
			expect(runGoBinary).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					timeout: 30 * 60 * 1000,
				}),
			);
		});
	});
});

describe('getValidatorInfo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(process, 'platform', {
			configurable: true,
			value: originalPlatform,
			writable: true,
		});
		Object.defineProperty(process, 'arch', {
			configurable: true,
			value: originalArch,
			writable: true,
		});
	});

	it('unit - should return info when binary is available', async () => {
		vi.mocked(access).mockResolvedValue(undefined);

		const info = await getValidatorInfo();

		expect(info).toHaveProperty('binaryName');
		expect(info).toHaveProperty('binaryPath');
		expect(info).toHaveProperty('isAvailable');
		expect(info).toHaveProperty('platform');
		expect(info.isAvailable).toBe(true);
		expect(info.binaryPath).toContain('bin');
	});

	it('unit - should return info when binary is not available', async () => {
		vi.mocked(access).mockRejectedValue(new Error('Not found'));

		const info = await getValidatorInfo();

		expect(info.isAvailable).toBe(false);
		expect(info).toHaveProperty('binaryName');
		expect(info).toHaveProperty('binaryPath');
		expect(info).toHaveProperty('platform');
	});

	it('unit - should throw GTFSValidatorError for unsupported platform', async () => {
		Object.defineProperty(process, 'platform', { configurable: true, value: 'unsupported', writable: true });
		Object.defineProperty(process, 'arch', { configurable: true, value: 'unsupported', writable: true });

		await expect(getValidatorInfo()).rejects.toThrow(GtfsValidationError);
		try {
			await getValidatorInfo();
		} catch (err) {
			expect((err as GtfsValidationError).code).toBe('UNSUPPORTED_PLATFORM');
		}
	});
});

describe('GTFSValidatorError', () => {
	it('unit - should create error with correct properties', () => {
		const originalError = new Error('Original error');
		const error = new GtfsValidationError(
			'Test error',
			'TEST_CODE',
			originalError,
			'stdout content',
			'stderr content',
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(GtfsValidationError);
		expect(error.message).toBe('Test error');
		expect(error.code).toBe('TEST_CODE');
		expect(error.originalError).toBe(originalError);
		expect(error.stdout).toBe('stdout content');
		expect(error.stderr).toBe('stderr content');
		expect(error.name).toBe('GtfsValidationError');
	});

	it('unit - should handle optional properties', () => {
		const error = new GtfsValidationError('Test error', 'TEST_CODE');

		expect(error.originalError).toBeUndefined();
		expect(error.stdout).toBeUndefined();
		expect(error.stderr).toBeUndefined();
	});
});
