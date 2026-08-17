/* * */

import { SYSTEM_ERROR_MESSAGES } from '@/consts/system-errors.js';
import { GTFS_VALIDATION_TIMEOUT_MS } from '@/consts/timeout.js';
import { normalizeValidationRules } from '@/utils/normalize-validation-rules.js';
import { runValidator } from '@/utils/run-validator/index.js';
// import { PAGE_ROUTES } from '@tmlmobilidade/consts';
// import { sendSucessfulGtfsValidationEmail, sendUnsuccessfulGtfsValidationEmail } from '@tmlmobilidade/emails';
import { getTmpWorkdirPath } from '@tmlmobilidade/files';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';
import pjson from 'pjson' with { type: 'json' };

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	let isClaimed = false;

	try {
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

		Logger.info({ message: `Transitioning GTFS Validation ${gtfsValidation._id} from ${gtfsValidation.processing_status} to processing...` });

		await goDb.operation.gtfsValidations.updateOne({
			_id: gtfsValidation._id,
			processing_status: gtfsValidation.processing_status,
			...(gtfsValidation.processing_status === 'processing' && { updated_at: gtfsValidation.updated_at }),
		}, {
			processing_status: 'processing',
			summary: null,
			validity_status: 'unknown',
		}, { returnResult: false });

		isClaimed = true;
		Logger.info({ message: `GTFS Validation ${gtfsValidation._id} is processing. Preparing the GTFS file and rules...` });

		//
		// Get the associated file document from MongoDB
		// and download the GTFS file to the temporary directory.

		Logger.info({ message: 'Downloading GTFS file...' });

		const gtfsFile = await storageProvider.findById(gtfsValidation.file_id);
		if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);

		const fileBuffer = await fetch(gtfsFile.url).then(res => res.arrayBuffer());

		fs.writeFileSync(gtfsFilePath, Buffer.from(fileBuffer));

		//
		// Normalize the agency-specific rules against the shared defaults
		// and write the complete rules structure to the working directory.
		// Missing or invalid rules inherit their configured default severity.

		const foundAgency = await goDb.core.agencies.findById(gtfsValidation.agency_id);
		if (!foundAgency) throw new Error(`Agency not found: ${gtfsValidation.agency_id}`);

		const normalizedRules = normalizeValidationRules(foundAgency.validation_rules);
		const rulesContent = JSON.stringify(normalizedRules);

		fs.writeFileSync(gtfsValidationRulesPath, rulesContent, { encoding: 'utf-8' });

		Logger.info({ message: `Normalized validation rules saved to: ${gtfsValidationRulesPath}` });

		const routesRules = normalizedRules.routes ?? {};
		console.log('GTFS validator rules runtime:', {
			has_legacy_routes_line_id: Object.hasOwn(routesRules, 'line_id'),
			has_legacy_routes_line_long_name: Object.hasOwn(routesRules, 'line_long_name'),
			has_legacy_routes_line_short_name: Object.hasOwn(routesRules, 'line_short_name'),
			rules_path: gtfsValidationRulesPath,
			sha256: createHash('sha256').update(rulesContent).digest('hex'),
		});

		//
		// Perform the GTFS validation using the project binary
		// and update the GTFS validation document in MongoDB with the results.

		Logger.info({ message: `GTFS Validation ${gtfsValidation._id} is processing. Starting the Go validator...` });

		const gtfsValidationSummary = await runValidator(gtfsFilePath, {
			lang: 'pt',
			log_level: 'debug',
			out_file: gtfsValidationResultPath,
			rules_path: gtfsValidationRulesPath,
			timeout: GTFS_VALIDATION_TIMEOUT_MS,
		});

		Logger.info({ message: 'Validation completed. Updating GTFS Validation document with results...' });

		const completionResult = await goDb.operation.gtfsValidations.updateOne({
			_id: gtfsValidation._id,
			processing_status: 'processing',
		}, {
			processing_status: 'complete',
			summary: gtfsValidationSummary as GtfsValidation['summary'],
			validity_status: gtfsValidationSummary.total_errors === 0 ? 'valid' : 'invalid',
		}, { returnResult: false });

		if (completionResult.matchedCount === 0) {
			Logger.info({ message: `Ignoring stale completion for GTFS Validation ${gtfsValidation._id}.` });
			return;
		}

		//
		// After successful validation, even if there are validation errors,
		// we consider the process complete and send the results to the user via email.
		// Fetch the user details from the created_by field of the GTFS Validation document
		// to personalize the email content and include a link to the validation detail.

		const updatedGtfsValidation = await goDb.operation.gtfsValidations.findById(gtfsValidation._id);

		if (!updatedGtfsValidation) throw new Error(`GTFS Validation not found after update: ${gtfsValidation._id}`);
		if (!updatedGtfsValidation.created_by) throw new Error(`No creator information found for file: ${gtfsFile._id}`);

		const foundUser = await goDb.core.users.findById(updatedGtfsValidation.created_by);
		if (!foundUser) throw new Error(`User not found: ${updatedGtfsValidation.created_by}`);

		try {
			if (updatedGtfsValidation.validity_status === 'valid') {
				// await sendSucessfulGtfsValidationEmail({
				// 	data: {
				// 		firstName: foundUser.first_name,
				// 		gtfsValidationId: gtfsValidation._id,
				// 		gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
				// 		totalWarnings: gtfsValidationSummary.total_warnings,
				// 	},
				// 	to: foundUser.email,
				// });
			} else {
				// await sendUnsuccessfulGtfsValidationEmail({
				// 	data: {
				// 		firstName: foundUser.first_name,
				// 		gtfsValidationId: gtfsValidation._id,
				// 		gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
				// 		totalErrors: gtfsValidationSummary.total_errors,
				// 		totalWarnings: gtfsValidationSummary.total_warnings,
				// 	},
				// 	to: foundUser.email,
				// });
			}
		} catch (error) {
			Logger.error({ error, message: 'Error sending validation result email:' });
		}

		//
		// Cleanup the working directory by removing
		// the downloaded GTFS file and the validation result file.

		try {
			fs.rmSync(tempWorkdirPath, { force: true, recursive: true });
			Logger.info({ message: 'Cleaned up temporary files.' });
		} catch (error) {
			Logger.error({ error, message: 'Error during cleanup of temporary files:' });
		}

		//
	} catch (error) {
		// If any errors occur during validation, catch them and format
		// a custom error result to be saved in the database and sent via email.
		Logger.error({ error, message: `Error processing GTFS Validation ${gtfsValidation._id}:` });

		if (!isClaimed) return;

		const errorResult = await goDb.operation.gtfsValidations.updateOne({
			_id: gtfsValidation._id,
			processing_status: 'processing',
		}, {
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
		}, { returnResult: false });

		if (errorResult.matchedCount === 0) {
			Logger.info({ message: `Ignoring stale error for GTFS Validation ${gtfsValidation._id}.` });
			return;
		}

		// await sendSystemErrorEmail({
		// 	data: {
		// 		errorMessage: error.message ?? 'Unknown error',
		// 		serviceName: pjson.name,
		// 		timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
		// 	},
		// 	to: SYSTEM_CONTACT_EMAIL,
		// });
	}
}
