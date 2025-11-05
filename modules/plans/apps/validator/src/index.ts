/* * */

import logger from '@helperkits/logger';
import { rabbitMQ } from '@tmlmobilidade/connectors';
import { sendFailedBackupEmail, sendGtfsValidationEmail } from '@go/emails';
import { GTFSValidator, GTFSValidatorError, GTFSValidatorResult } from '@tmlmobilidade/gtfs-validator';
import { files, gtfsValidations } from '@go/interfaces';
import { getCurrentEnvironment } from '@go/types';
import { Dates } from '@go/utils-dates';
import { access, constants, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface ValidationMessage {
	file_id: string
	validation_id: string
}

async function validateFile(filePath: string): Promise<GTFSValidatorResult['summary']> {
	//

	//
	// Get the environment and rules path
	const environment = getCurrentEnvironment();
	const rulesPath = environment === 'development' ? undefined : '/secrets/tml-rules.json';

	//
	// Check if the file exists
	// Validate rules file exists in production
	if (environment !== 'development' && rulesPath) {
		try {
			await access(rulesPath, constants.F_OK | constants.R_OK);
			logger.info(`Using custom validation rules: ${rulesPath}`);
		}
		catch (err) {
			const msg = `Custom rules file not accessible: ${rulesPath}. Falling back to default rules. Error: ${err instanceof Error ? err.message : String(err)}`;
			logger.error(msg);
			throw new Error(msg);
		}
	}

	try {
		const validationResult = await GTFSValidator(filePath, {
			lang: 'pt',
			rules_path: rulesPath,
			timeout: 1000 * 60 * 15, // 15 minutes for large feeds
		});

		return validationResult.summary;
	}
	catch (err) {
		if (err instanceof GTFSValidatorError) {
			switch (err.code) {
				case 'BINARY_NOT_FOUND':
					logger.error(`GTFS validator binary not found for platform ${process.platform}-${process.arch}`);
					break;
				case 'INPUT_NOT_ACCESSIBLE':
					logger.error(`Cannot access GTFS file: ${filePath}`);
					break;
				case 'VALIDATION_TIMEOUT':
					logger.error(`GTFS validation timed out - feed may be too large or complex`);
					break;
				case 'VALIDATOR_ERROR':
					logger.error(`GTFS validator failed with error: ${err.message}`);
					if (err.stderr) {
						logger.error(`Validator stderr: ${err.stderr}`);
					}
					break;
				default:
					logger.error(`GTFS validation failed: ${err.message}`);
			}

			// Re-throw to let calling code handle the failure
			throw err;
		}
		else {
			logger.error(`Unexpected error during GTFS validation: ${err instanceof Error ? err.message : String(err)}`);
			throw err;
		}
	}
}

async function processValidation(message: ValidationMessage) {
	try {
		logger.info('Processing validation...');
		// 1. Update validation status to processing
		const validation = await gtfsValidations.updateById(message.validation_id, {
			feeder_status: 'processing',
		});

		logger.info(`Validation set to processing: ${validation.feeder_status}`);

		// 2. Get the file from MongoDB
		const file = await files.findById(message.file_id);
		if (!file) {
			throw new Error(`File not found: ${message.file_id}`);
		}

		logger.info(`Getting file from MongoDB: ${file._id}`);

		// 3. Download and write file to temp directory for validation
		logger.info(`Downloading file from ${file.url}`);
		const fileBuffer = await fetch(file.url).then(res => res.arrayBuffer());
		const tempFilePath = join(tmpdir(), `gtfs_${message.file_id}.zip`);
		await writeFile(tempFilePath, Buffer.from(fileBuffer));

		logger.info(`File downloaded and written to temp directory: ${tempFilePath}`);

		// 4. Run GTFS validation
		logger.info(`Validating file: ${tempFilePath}`);

		let validationResult: GTFSValidatorResult['summary'];
		try {
			validationResult = await validateFile(tempFilePath);
		}
		catch (error) {
			validationResult = {
				messages: [
					{
						field: 'N/A',
						file_name: 'Erro do sistema',
						message: error instanceof Error ? error.message : String(error),
						rows: [],
						severity: 'error',
						validation_id: message.validation_id,
					},
				],
				total_errors: 1,
				total_warnings: 0,
			};
		}

		logger.info(`File validated, updating document in MongoDB`);

		// 6. Update validation status based on results
		await gtfsValidations.updateById(message.validation_id, {
			feeder_status: validationResult.total_errors > 0 ? 'error' : 'complete',
			summary: validationResult,
		});

		// Send email to user
		try {
			const latest_validation = await gtfsValidations.findById(message.validation_id);
			await sendGtfsValidationEmail({
				props: {
					first_name: '',
					validation: latest_validation,
				},
				to: file.created_by,
			});
		}
		catch (error) {
			logger.error('Error sending email:', error);
		}

		logger.success('Validation Finished Successfully');
		logger.divider();
	}
	catch (error) {
		console.log('ERROR:', error);
		logger.error('Error processing validation:', error);

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
		}
		catch (error) {
			logger.error('Error sending email:', error);
		}

		// Update validation status to error
		await gtfsValidations.updateById(message.validation_id, {
			feeder_status: 'error',
			summary: {
				messages: [
					{
						field: 'N/A',
						file_name: 'Erro do sistema',
						message: error instanceof Error ? error.message : JSON.stringify(error),
						rows: [],
						severity: 'error',
						validation_id: message.validation_id,
					},
				],
				total_errors: 1,
				total_warnings: 0,
			},
		});
	}
}

async function main() {
	// Subscribe to validation queue
	await rabbitMQ.subscribe('gtfs-validation', async (message) => {
		const validationMessage = JSON.parse(message.toString()) as ValidationMessage;

		logger.spacer(3);
		logger.title('🚀 Validation message received');
		logger.info(JSON.stringify(validationMessage));

		await processValidation(validationMessage);
	});

	logger.divider('🚀 GTFS Validator service started');
}

(async function startMainLoop() {
	while (true) {
		try {
			await main();
			break; // Exit loop if main resolves without error
		}
		catch (err) {
			logger.error('Fatal error in main():', err);
			logger.info('Restarting main() in 5 seconds...');
			await new Promise(res => setTimeout(res, 5000));
		}
	}
})();

/* * */
