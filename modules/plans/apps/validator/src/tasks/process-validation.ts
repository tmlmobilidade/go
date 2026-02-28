/* * */

import { validateFile } from '@/tasks/validate-file.js';
import { SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendSucessfulGtfsValidationEmail, sendSystemErrorEmail } from '@tmlmobilidade/emails';
import { getTmpWorkdirPath } from '@tmlmobilidade/files';
import { files, gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsValidation } from '@tmlmobilidade/types';
import fs from 'node:fs';
import { join } from 'node:path';
import pjson from 'package.json' with { type: 'json' };

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		//

		//
		// Setup temporary directory paths for this validation process
		// to avoid any conflicts with other concurrent validations.

		const tempWorkdirPath = getTmpWorkdirPath();

		const gtfsFilePath = join(tempWorkdirPath, `${gtfsValidation.file_id}.zip`);
		const gtfsValidationResultPath = join(tempWorkdirPath, `gtfs_validation_${gtfsValidation._id}.json`);

		//
		// Update the gtfs validation document to 'processing' status
		// and save the paths for reference in case of errors

		Logger.info('Updating GTFS Validation document...');

		await gtfsValidations.updateById(gtfsValidation._id, { system_status: 'processing' });

		//
		// Get the associated file document from MongoDB
		// and download the GTFS file to the temporary directory.

		Logger.info('Downloading GTFS file...');

		const gtfsFile = await files.findById(gtfsValidation.file_id);
		if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);

		const fileBuffer = await fetch(gtfsFile.url).then(res => res.arrayBuffer());

		fs.writeFileSync(gtfsFilePath, Buffer.from(fileBuffer));

		//
		// Perform the GTFS validation using the GTFSValidator library
		// and update the GTFS validation document in MongoDB with the results.

		Logger.info('Performing the actual GTFS validation...');

		const gtfsValidationResult = await validateFile(gtfsFilePath, gtfsValidationResultPath, gtfsValidation.gtfs_agency.agency_id);

		Logger.info('Validation completed. Updating GTFS Validation document with results...');

		await gtfsValidations.updateById(gtfsValidation._id, {
			is_valid: gtfsValidationResult.total_errors === 0,
			summary: gtfsValidationResult,
			system_status: 'complete',
		});

		//
		// After successful validation, even if there are validation errors,
		// we consider the process complete and send the results to the user via email.

		const updatedGtfsValidation = await gtfsValidations.findById(gtfsValidation._id);

		try {
			if (updatedGtfsValidation.is_valid) {
				await sendSucessfulGtfsValidationEmail({
					data: {
						firstName: '',
						gtfsValidationId: gtfsValidation._id,
						gtfsValidationUrl: `https://plans.tmlmobilidade.pt/validations/${gtfsValidation._id}`,
						totalWarnings: gtfsValidationResult.total_warnings,
					},
					to: gtfsFile.created_by,
				});
			} else {
				await sendSystemErrorEmail({
					data: {
						errorMessage: `GTFS validation completed with errors. Total Errors: ${gtfsValidationResult.total_errors}, Total Warnings: ${gtfsValidationResult.total_warnings}`,
						serviceName: pjson.name,
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
					to: gtfsFile.created_by,
				});
			}
		} catch (error) {
			Logger.error('Error sending validation result email:', error);
			await sendSystemErrorEmail({
				data: {
					errorMessage: error instanceof Error ? error.message : String(error),
					serviceName: pjson.name,
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
				to: SYSTEM_CONTACT_EMAIL,
			});
		}

		//
		// Cleanup the working directory by removing
		// the downloaded GTFS file and the validation result file.

		try {
			fs.rmdirSync(tempWorkdirPath);
			Logger.info('Cleaned up temporary files.');
		} catch (error) {
			Logger.error('Error during cleanup of temporary files:', error);
		}

		//
	} catch (error) {
		// If any errors occur during validation, catch them and format
		// a custom error result to be saved in the database and sent via email.
		Logger.error('Error during GTFS validation:', error);
		await gtfsValidations.updateById(gtfsValidation._id, {
			summary: {
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
			},
			system_status: 'error',
		});
		await sendSystemErrorEmail({
			data: {
				errorMessage: error.message ?? 'Unknown error',
				serviceName: pjson.name,
				timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
			},
			to: SYSTEM_CONTACT_EMAIL,
		});
	}
}
