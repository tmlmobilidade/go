import type { GtfsValidatorOptions } from './interfaces/index.js';

/**
 * Builds command line arguments for the GTFS validator.
 *
 * @param input - The input path
 * @param options - Validation options
 * @returns Array of command line arguments
 *
 * @internal
 */
export function buildValidatorArgs(input: string, options: GtfsValidatorOptions = {}): string[] {
	const args: string[] = ['-input', input];

	if (options.out_file) {
		args.push('-out', options.out_file);
	}

	if (options.rules_path) {
		args.push('-rules', options.rules_path);
	}

	if (options.lang) {
		args.push('-lang', options.lang);
	}

	if (options.log_level) {
		args.push('-log', options.log_level);
	}

	return args;
}
