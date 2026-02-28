/* * */

import { validateFile } from '@/tasks/validate-file.js';
import { Dates } from '@tmlmobilidade/dates';
import { GTFSValidatorResult } from '@tmlmobilidade/gtfs-validator';
import { files, gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsValidation } from '@tmlmobilidade/types';
import { unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	//

	//
	// Setup temporary directory paths for this validation process
	// to avoid any conflicts with other concurrent validations.

	const tempFilePath = join(tmpdir(), `gtfs_${gtfsValidation.file_id}.zip`);
	const outputFilePath = join(tmpdir(), `gtfs_validation_${gtfsValidation._id}.json`);

	try {
		Logger.info('Processing validation...');

		// 1. Update validation status to processing
		const updatedValidation = await gtfsValidations.updateById(gtfsValidation._id, {
			feeder_status: 'processing',
		});

		Logger.info(`Validation set to processing: ${updatedValidation.feeder_status}`);

		// 2. Get the file from MongoDB
		const file = await files.findById(gtfsValidation.file_id);
		if (!file) {
			throw new Error(`File not found: ${gtfsValidation.file_id}`);
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
			validationResult = await validateFile(tempFilePath, outputFilePath, gtfsValidation.gtfs_agency.agency_id);
		} catch (error) {
			validationResult = {
				messages: [
					{
						field: 'N/A',
						file_name: 'Erro do sistema',
						message: error instanceof Error ? error.message : String(error),
						rows: [],
						severity: 'error',
						validation_id: gtfsValidation._id,
					},
				],
				total_errors: 1,
				total_warnings: 0,
			};
		}

		Logger.info(`File validated, updating document in MongoDB`);

		// 5. Update validation status based on results
		await gtfsValidations.updateById(gtfsValidation._id, {
			feeder_status: validationResult.total_errors > 0 ? 'error' : 'complete',
			summary: validationResult,
		});

		// 6. Send email to user
		try {
			const latest_validation = await gtfsValidations.findById(gtfsValidation._id);
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
			await gtfsValidations.updateById(gtfsValidation._id, {
				feeder_status: 'error',
				summary: {
					messages: [
						{
							field: 'N/A',
							file_name: 'Erro do sistema',
							message: error instanceof Error ? error.message : JSON.stringify(error),
							rows: [],
							severity: 'error',
							validation_id: gtfsValidation._id,
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
