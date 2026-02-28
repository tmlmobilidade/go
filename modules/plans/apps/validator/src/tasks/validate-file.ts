/* * */

import { GTFSValidator, GTFSValidatorError, GTFSValidatorResult } from '@tmlmobilidade/gtfs-validator';
import { agencies } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { getCurrentEnvironment } from '@tmlmobilidade/types';
import { access, constants, writeFile } from 'fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* * */

export async function validateFile(filePath: string, outputFilePath: string, agency_id: string): Promise<GTFSValidatorResult['summary']> {
	//
	// Get the environment and rules path
	const environment = getCurrentEnvironment();
	let rulesPath = environment === 'development' ? undefined : join(tmpdir(), 'tml-rules.json');

	// Get agency rules
	const agency = await agencies.findById(agency_id);
	if (!agency) {
		throw new Error(`Agency not found: ${agency_id}`);
	}

	if (agency.validation_rules != null) {
		// Write temporary file with agency rules
		const tempRulesFilePath = join(tmpdir(), `gtfs_validation_rules_${agency_id}.json`);
		const rulesContent = typeof agency.validation_rules === 'string'
			? agency.validation_rules
			: JSON.stringify(agency.validation_rules);

		Logger.info(`Writing temporary file with agency rules to: ${tempRulesFilePath}`);
		await writeFile(tempRulesFilePath, rulesContent, { encoding: 'utf-8' });
		Logger.info(`Using custom validation rules: ${tempRulesFilePath}`);
		rulesPath = tempRulesFilePath;
	}

	//
	// Check if the file exists
	// Validate rules file exists in production
	if (environment !== 'development' && rulesPath) {
		try {
			await access(rulesPath, constants.F_OK | constants.R_OK);
			Logger.info(`Using custom validation rules: ${rulesPath}`);
		} catch (err) {
			const msg = `Custom rules file not accessible: ${rulesPath}. Falling back to default rules. Error: ${err instanceof Error ? err.message : String(err)}`;
			Logger.error(msg);
			throw new Error(msg);
		}
	}

	try {
		Logger.info(`Writing validation output to: ${outputFilePath}`);
		const validationResult = await GTFSValidator(filePath, {
			lang: 'pt',
			log_level: getCurrentEnvironment() === 'production' ? 'info' : 'debug',
			out_file: outputFilePath,
			rules_path: rulesPath,
		});

		Logger.info(`Validation completed in ${validationResult.executionTime}ms`);
		return validationResult.summary;
	} catch (err) {
		if (err instanceof GTFSValidatorError) {
			switch (err.code) {
				case 'BINARY_NOT_FOUND':
					Logger.error(`GTFS validator binary not found for platform ${process.platform}-${process.arch}`);
					break;
				case 'ERROR_OUTPUT_TOO_LARGE':
					Logger.error(`Validation error output exceeded maximum size.`);
					break;
				case 'INPUT_NOT_ACCESSIBLE':
					Logger.error(`Cannot access GTFS file: ${filePath}`);
					break;
				case 'OUTPUT_TOO_LARGE':
					Logger.error(`Validation output exceeded maximum size. The GTFS feed may be too large.`);
					break;
				case 'PARSE_ERROR':
					Logger.error(`Failed to parse validation results. The validator may have crashed or produced invalid output.`);
					break;
				case 'VALIDATION_TIMEOUT':
					Logger.error(`GTFS validation timed out - feed may be too large or complex`);
					break;
				case 'VALIDATOR_ERROR':
					Logger.error(`GTFS validator failed with error: ${err.message}`);
					if (err.stderr) {
						Logger.error(`Validator stderr: ${err.stderr}`);
					}
					break;
				default:
					Logger.error(`GTFS validation failed: ${err.message}`);
			}

			// Re-throw to let calling code handle the failure
			throw err;
		} else {
			Logger.error(`Unexpected error during GTFS validation: ${err instanceof Error ? err.message : String(err)}`);
			throw err;
		}
	}
}
