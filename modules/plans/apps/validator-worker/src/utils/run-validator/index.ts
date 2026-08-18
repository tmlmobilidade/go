import { GtfsValidationOutputSummary, GtfsValidationOutputSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { promisify } from 'node:util';

import { getValidatorBinaryPath } from './get-validator-binary-path.js';
import { runValidatorProcess } from './run-validator-process.js';

const execFileAsync = promisify(execFile);

/* * */

interface ValidatorOptions {
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
export async function runValidator(inputPath: string, options: ValidatorOptions): Promise<GtfsValidationOutputSummary> {
	const binaryPath = await getValidatorBinaryPath();

	// Log an immutable fingerprint and the self-reported version so deployed
	// validation results can be traced to the exact executable artifact.
	const binaryContent = readFileSync(binaryPath);
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

	// Treat malformed or schema-incompatible output as a worker failure rather
	// than persisting an incomplete summary.
	const resultContent = readFileSync(options.out_file, 'utf8');
	return GtfsValidationOutputSummarySchema.parse(JSON.parse(resultContent));
}
