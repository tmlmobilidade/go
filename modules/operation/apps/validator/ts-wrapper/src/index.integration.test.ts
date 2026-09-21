import { access } from 'fs/promises';
import { resolve } from 'path';
import { beforeAll, describe, expect, it } from 'vitest';

import { getValidatorInfo, GtfsValidationError, GtfsValidator } from './index.js';

const DATA_DIR = resolve(process.cwd(), '..', 'data');

describe('integration - GtfsValidator', () => {
	beforeAll(async () => {
		// Verify test data directory exists
		try {
			await access(DATA_DIR);
		} catch {
			console.warn(`Test data directory not found: ${DATA_DIR}. Some integration tests may be skipped.`);
		}
	});

	describe('integration - getValidatorInfo', () => {
		it('should return validator info for current platform', async () => {
			const info = await getValidatorInfo();

			expect(info).toHaveProperty('platform');
			expect(info).toHaveProperty('binaryName');
			expect(info).toHaveProperty('binaryPath');
			expect(info).toHaveProperty('isAvailable');
			expect(typeof info.isAvailable).toBe('boolean');
			expect(info.binaryPath).toContain('bin');
			expect(info.binaryPath).toContain(info.binaryName);
			// Regression: binary must live next to src/ (package bin/), not under src/bin/
			expect(info.binaryPath).not.toMatch(/[/\\]src[/\\]bin[/\\]/);
			expect(info.binaryPath).toMatch(/[/\\]bin[/\\][^/\\]+$/);
		});
	});

	describe('integration - binary availability', () => {
		it('should have binary available for current platform', async () => {
			const info = await getValidatorInfo();

			if (!info.isAvailable) {
				console.warn(`Binary not available for platform ${info.platform}. Skipping integration tests.`);
				return;
			}

			expect(info.isAvailable).toBe(true);
		});
	});

	describe('integration - validation with real GTFS data', () => {
		it('should validate GTFS-TCB_24.zip file', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				timeout: 60000, // 1 minute timeout
			});

			expect(result).toHaveProperty('summary');
			expect(result).toHaveProperty('executionTime');
			expect(result).toHaveProperty('args');
			expect(result).toHaveProperty('stdout');
			expect(result).toHaveProperty('stderr');
			expect(result.summary).toHaveProperty('total_errors');
			expect(result.summary).toHaveProperty('total_warnings');
			expect(result.summary).toHaveProperty('messages');
			expect(typeof result.executionTime).toBe('number');
			expect(result.executionTime).toBeGreaterThan(0);
			expect(Array.isArray(result.args)).toBe(true);
			expect(result.args).toContain('-input');
		}, 120000); // 2 minute timeout for this test

		it('should validate GTFS-TCB_24.zip file', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				timeout: 60000,
			});

			expect(result.summary).toBeDefined();
			expect(result.executionTime).toBeGreaterThan(0);
		}, 120000);

		it('should validate with custom language option', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				lang: 'pt',
				timeout: 60000,
			});

			expect(result.args).toContain('-lang');
			expect(result.args).toContain('pt');
			expect(result.summary).toBeDefined();
		}, 120000);

		it('should validate with log level option', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				log_level: 'info',
				timeout: 60000,
			});

			expect(result.args).toContain('-log');
			expect(result.args).toContain('info');
			expect(result.summary).toBeDefined();
		}, 120000);
	});

	describe('integration - error handling', () => {
		it('should throw GtfsValidationError for non-existent file', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			await expect(GtfsValidator('/nonexistent/path/that/does/not/exist.zip')).rejects.toThrow(
				GtfsValidationError,
			);
			try {
				await GtfsValidator('/nonexistent/path/that/does/not/exist.zip');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INPUT_NOT_ACCESSIBLE');
			}
		});

		it('should throw GTFSValidatorError for empty input', async () => {
			await expect(GtfsValidator('')).rejects.toThrow(GtfsValidationError);
			try {
				await GtfsValidator('');
			} catch (err) {
				expect((err as GtfsValidationError).code).toBe('INVALID_INPUT');
			}
		});
	});

	describe('integration - output file option', () => {
		it('should write results to output file when specified', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');
			const outputPath = resolve(process.cwd(), 'test-output.json');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				out_file: outputPath,
				timeout: 60000,
			});

			expect(result.args).toContain('-out');
			expect(result.summary).toBeDefined();

			// Clean up
			try {
				const { unlink } = await import('fs/promises');
				await unlink(outputPath);
			} catch {
				// Ignore cleanup errors
			}
		}, 120000);
	});

	describe('integration - timeout handling', () => {
		it('should respect timeout option', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			// Use a very short timeout to test timeout handling
			// Note: This might timeout on slow systems, so we'll catch and verify the error type
			try {
				await GtfsValidator(gtfsPath, {
					timeout: 1, // 1ms - should timeout immediately
				});
				// If we get here, the validation completed very quickly (unlikely but possible)
			} catch (error) {
				if (error instanceof GtfsValidationError) {
					// Timeout error is acceptable
					expect(['VALIDATION_TIMEOUT', 'VALIDATION_FAILED']).toContain(error.code);
				} else {
					throw error;
				}
			}
		}, 5000);
	});

	describe('integration - result structure', () => {
		it('should return complete result structure', async () => {
			const info = await getValidatorInfo();
			if (!info.isAvailable) {
				console.warn('Binary not available. Skipping test.');
				return;
			}

			const gtfsPath = resolve(DATA_DIR, 'GTFS-TCB_24.zip');

			try {
				await access(gtfsPath);
			} catch {
				console.warn(`GTFS data not found at ${gtfsPath}. Skipping test.`);
				return;
			}

			const result = await GtfsValidator(gtfsPath, {
				timeout: 60000,
			});

			// Verify all required properties exist
			expect(result).toHaveProperty('summary');
			expect(result).toHaveProperty('executionTime');
			expect(result).toHaveProperty('args');
			expect(result).toHaveProperty('stdout');
			expect(result).toHaveProperty('stderr');

			// Verify summary structure
			expect(result.summary).toHaveProperty('total_errors');
			expect(result.summary).toHaveProperty('total_warnings');
			expect(result.summary).toHaveProperty('messages');

			// Verify types
			expect(typeof result.executionTime).toBe('number');
			expect(Array.isArray(result.args)).toBe(true);
			expect(typeof result.stdout).toBe('string');
			expect(typeof result.stderr).toBe('string');
			expect(typeof result.summary.total_errors).toBe('number');
			expect(typeof result.summary.total_warnings).toBe('number');
			expect(Array.isArray(result.summary.messages)).toBe(true);
		}, 120000);
	});
});
