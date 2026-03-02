/* * */

import { Dates } from '@tmlmobilidade/dates';
import { sendFailedBackupEmail, sendGtfsValidationEmail } from '@tmlmobilidade/emails';
import { GTFSValidator, GTFSValidatorError, GTFSValidatorResult } from '@tmlmobilidade/gtfs-validator';
import { agencies, files, gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { getCurrentEnvironment, type GtfsValidation } from '@tmlmobilidade/types';
import { access, constants, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* * */

async function validateFile(filePath: string, outputFilePath: string, agency_id: string): Promise<GTFSValidatorResult['summary']> {
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

async function processValidation(validation: GtfsValidation) {
	const tempFilePath = join(tmpdir(), `gtfs_${validation.file_id}.zip`);
	const outputFilePath = join(tmpdir(), `gtfs_validation_${validation._id}.json`);

	try {
		Logger.info('Processing validation...');

		// 1. Update validation status to processing
		const updatedValidation = await gtfsValidations.updateById(validation._id, {
			feeder_status: 'processing',
		});

		Logger.info(`Validation set to processing: ${updatedValidation.feeder_status}`);

		// 2. Get the file from MongoDB
		const file = await files.findById(validation.file_id);
		if (!file) {
			throw new Error(`File not found: ${validation.file_id}`);
		}

		Logger.info(`Getting file from MongoDB: ${file._id}`);

		// 3. Download and write file to temp directory for validation
		Logger.info(`Downloading file from ${file.url}`);
		const fileBuffer = await fetch(file.url).then(res => res.arrayBuffer());
		await writeFile(tempFilePath, Buffer.from(fileBuffer));

		Logger.info(`File downloaded and written to temp directory: ${tempFilePath}`);

		// 4. Run GTFS validation with output file
		Logger.info(`Validating file: ${tempFilePath}`);

		let validationResult: GTFSValidatorResult['summary'];
		try {
			validationResult = await validateFile(tempFilePath, outputFilePath, validation.gtfs_agency.agency_id);
		} catch (error) {
			validationResult = {
				messages: [
					{
						field: 'N/A',
						file_name: 'Erro do sistema',
						message: error instanceof Error ? error.message : String(error),
						rows: [],
						severity: 'error',
						validation_id: validation._id,
					},
				],
				total_errors: 1,
				total_warnings: 0,
			};
		}

		Logger.info(`File validated, updating document in MongoDB`);

		// 5. Update validation status based on results
		await gtfsValidations.updateById(validation._id, {
			feeder_status: validationResult.total_errors > 0 ? 'error' : 'complete',
			summary: validationResult,
		});

		// 6. Send email to user
		try {
			const latest_validation = await gtfsValidations.findById(validation._id);
			await sendGtfsValidationEmail({
				props: {
					first_name: '',
					validation: latest_validation,
				},
				to: file.created_by,
			});
		} catch (error) {
			Logger.error('Error sending email:', error);
		}

		Logger.success('Validation Finished Successfully');
		Logger.divider();
	} catch (error) {
		Logger.error('Error processing validation:', error);

		// Send email to system
		try {
			if (process.env.EMAIL_TO) {
				await sendFailedBackupEmail({
					props: {
						backup_service: 'Validator',
						error_message: error instanceof Error ? error.message : JSON.stringify(error),
						failure_time: Dates.now('Europe/Lisbon').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS),
					},
					to: process.env.EMAIL_TO,
				});
			}
		} catch (emailError) {
			Logger.error('Error sending email:', emailError);
		}

		// Update validation status to error
		try {
			await gtfsValidations.updateById(validation._id, {
				feeder_status: 'error',
				summary: {
					messages: [
						{
							field: 'N/A',
							file_name: 'Erro do sistema',
							message: error instanceof Error ? error.message : JSON.stringify(error),
							rows: [],
							severity: 'error',
							validation_id: validation._id,
						},
					],
					total_errors: 1,
					total_warnings: 0,
				},
			});
		} catch (updateError) {
			Logger.error('Error updating validation status:', updateError);
		}
	} finally {
		// Clean up temporary files
		try {
			await Promise.allSettled([
				unlink(tempFilePath).catch(() => {
					// Ignore errors if file doesn't exist
				}),
				unlink(outputFilePath).catch(() => {
					// Ignore errors if file doesn't exist
				}),
			]);
			Logger.info('Temporary files cleaned up');
		} catch (cleanupError) {
			Logger.error('Error cleaning up temporary files:', cleanupError);
		}
	}
}

const RUN_INTERVAL = 10_000; // 10 seconds

/* * */

await (async function init() {
	const runOnInterval = async () => {
		Logger.init();

		const globalTimer = new Timer();

		try {
			// Query for waiting validations
			const waitingValidations = await gtfsValidations.findMany(
				{ feeder_status: { $in: ['waiting', 'processing'] } },
				{ sort: { created_at: 1 } }, // Process oldest first
			);

			Logger.info(`Found ${waitingValidations.length} waiting or stuck validations`);

			// Process each waiting validation
			for (const validation of waitingValidations) {
				Logger.spacer(3);
				Logger.title('🚀 Processing validation...');
				Logger.info(`Validation ID: ${validation._id}, File ID: ${validation.file_id}`);

				await processValidation(validation);
			}

			if (waitingValidations.length === 0) {
				Logger.info('No waiting validations to process');
			}
		} catch (error) {
			Logger.error('Error processing validations:', error);
		}

		Logger.terminate(`Validation check completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();

/* * */
