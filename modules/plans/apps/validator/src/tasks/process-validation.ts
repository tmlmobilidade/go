/* * */

import { SYSTEM_ERROR_MESSAGES } from '@/consts/system-errors.js';
import { PAGE_ROUTES, SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendSucessfulGtfsValidationEmail, sendSystemErrorEmail, sendUnsuccessfulGtfsValidationEmail } from '@tmlmobilidade/emails';
import { getTmpWorkdirPath } from '@tmlmobilidade/files';
import { GTFSValidator } from '@tmlmobilidade/gtfs-validator';
import { agencies, files, gtfsValidations, users } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsValidation } from '@tmlmobilidade/types';
import fs from 'node:fs';
import { join } from 'node:path';
import pjson from 'pjson' with { type: 'json' };

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		//

		//
		// Check if the GTFS validation has already been attempted 3 times.
		// If so, mark it as 'error' to avoid infinite retries on problematic files.

		if ((gtfsValidation.validation_attempts ?? 0) >= 3) {
			Logger.error(`GTFS Validation ${gtfsValidation._id} has already been attempted 3 times. Marking as error.`);
			await gtfsValidations.updateById(gtfsValidation._id, {
				processing_status: 'error',
				summary: {
					messages: [SYSTEM_ERROR_MESSAGES.MAX_ATTEMPTS_REACHED],
					total_errors: 1,
					total_warnings: 0,
				},
			});
			return;
		}

		//
		// Setup temporary directory paths for this validation process
		// to avoid any conflicts with other concurrent validations.

		const tempWorkdirPath = getTmpWorkdirPath(null, true);

		const gtfsFilePath = join(tempWorkdirPath, `${gtfsValidation.file_id}.zip`);
		const gtfsValidationRulesPath = join(tempWorkdirPath, `rules_${gtfsValidation._id}.json`);
		const gtfsValidationResultPath = join(tempWorkdirPath, `result_${gtfsValidation._id}.json`);

		//
		// Update the gtfs validation document to 'processing' status
		// and save the paths for reference in case of errors

		Logger.info('Updating GTFS Validation document...');

		await gtfsValidations.updateById(gtfsValidation._id, {
			processing_status: 'processing',
			validation_attempts: (gtfsValidation.validation_attempts ?? 0) + 1,
		});

		//
		// Get the associated file document from MongoDB
		// and download the GTFS file to the temporary directory.

		Logger.info('Downloading GTFS file...');

		const gtfsFile = await files.findById(gtfsValidation.file_id);
		if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);

		const fileBuffer = await fetch(gtfsFile.url).then(res => res.arrayBuffer());

		fs.writeFileSync(gtfsFilePath, Buffer.from(fileBuffer));

		//
		// Get the agency-specific validation rules, if they exist,
		// and download them to the working directory. Throw an error
		// if no agency is found or if the rules file is not accessible.

		const foundAgency = await agencies.findById(gtfsValidation.gtfs_agency.agency_id);
		if (!foundAgency) throw new Error(`Agency not found: ${gtfsValidation.gtfs_agency.agency_id}`);
		if (!foundAgency.validation_rules) throw new Error(`No validation rules found for agency: ${gtfsValidation.gtfs_agency.agency_id}`);

		const rulesContent = typeof foundAgency.validation_rules === 'string'
			? foundAgency.validation_rules
			: JSON.stringify(foundAgency.validation_rules);

		fs.writeFileSync(gtfsValidationRulesPath, rulesContent, { encoding: 'utf-8' });

		Logger.info(`Custom validation rules saved to: ${gtfsValidationRulesPath}`);

		//
		// Perform the GTFS validation using the GTFSValidator library
		// and update the GTFS validation document in MongoDB with the results.

		Logger.info('Performing the actual GTFS validation...');

		const gtfsValidationResult = await GTFSValidator(gtfsFilePath, {
			lang: 'pt',
			log_level: 'debug',
			out_file: gtfsValidationResultPath,
			rules_path: gtfsValidationRulesPath,
		});

		Logger.info('Validation completed. Updating GTFS Validation document with results...');

		await gtfsValidations.updateById(gtfsValidation._id, {
			processing_status: 'complete',
			summary: gtfsValidationResult.summary,
			validity_status: gtfsValidationResult.summary.total_errors === 0 ? 'valid' : 'invalid',
		});

		//
		// After successful validation, even if there are validation errors,
		// we consider the process complete and send the results to the user via email.
		// Fetch the user details from the created_by field of the GTFS Validation document
		// to personalize the email content and include a link to the validation detail.

		const updatedGtfsValidation = await gtfsValidations.findById(gtfsValidation._id);

		if (!updatedGtfsValidation) throw new Error(`GTFS Validation not found after update: ${gtfsValidation._id}`);
		if (!updatedGtfsValidation.created_by) throw new Error(`No creator information found for file: ${gtfsFile._id}`);

		const foundUser = await users.findById(updatedGtfsValidation.created_by);
		if (!foundUser) throw new Error(`User not found: ${updatedGtfsValidation.created_by}`);

		try {
			if (updatedGtfsValidation.validity_status === 'valid') {
				await sendSucessfulGtfsValidationEmail({
					data: {
						firstName: foundUser.first_name,
						gtfsValidationId: gtfsValidation._id,
						gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
						totalWarnings: gtfsValidationResult.summary.total_warnings,
					},
					to: foundUser.email,
				});
			} else {
				await sendUnsuccessfulGtfsValidationEmail({
					data: {
						firstName: foundUser.first_name,
						gtfsValidationId: gtfsValidation._id,
						gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
						totalErrors: gtfsValidationResult.summary.total_errors,
						totalWarnings: gtfsValidationResult.summary.total_warnings,
					},
					to: foundUser.email,
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
			fs.rmSync(tempWorkdirPath, { force: true, recursive: true });
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
			processing_status: 'error',
			summary: {
				messages: [{
					...SYSTEM_ERROR_MESSAGES.GENERIC_ERROR,
					// Override the generic error message with
					// the actual error message for more context.
					message: error instanceof Error ? error.message : String(error),
				}],
				total_errors: 1,
				total_warnings: 0,
			},
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
