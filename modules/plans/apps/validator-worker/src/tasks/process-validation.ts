/* * */

import { SYSTEM_ERROR_MESSAGES } from '@/consts/system-errors.js';
import { GTFS_VALIDATION_TIMEOUT_MS } from '@/consts/timeout.js';
import { normalizeValidationRules } from '@/utils/normalize-rules/normalize-rules.js';
import { runValidator } from '@/utils/run-validator/index.js';
// import { PAGE_ROUTES } from '@tmlmobilidade/consts';
// import { sendSucessfulGtfsValidationEmail, sendUnsuccessfulGtfsValidationEmail } from '@tmlmobilidade/emails';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';
// import pjson from 'pjson' with { type: 'json' };

import { downloadGtfs } from './download-gtfs.js';
import { setupPathsForValidation } from './setup-paths-for-validation.js';

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		//

		// Give each validation an isolated workspace for its input, normalized
		// rules, and validator output.

		const { gtfsFilePath, gtfsValidationResultPath, gtfsValidationRulesPath, tempWorkdirPath } = setupPathsForValidation(gtfsValidation);

		//
		// Compare against the state that was fetched by the polling loop. For a
		// retried processing record, updated_at also prevents claiming a newer run.

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

		Logger.info({ message: `GTFS Validation ${gtfsValidation._id} is processing. Preparing the GTFS file and rules...` });

		//
		// Get the associated file document from MongoDB
		// and download the GTFS file to the temporary directory.

		await downloadGtfs(gtfsValidation, gtfsFilePath);

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

		//
		// Run the project-owned Go binary. It writes its JSON summary to the output
		// path, which runValidator parses and validates before returning.

		Logger.info({ message: `GTFS Validation ${gtfsValidation._id} is processing. Starting the Go validator...` });

		const gtfsValidationSummary = await runValidator(gtfsFilePath, {
			lang: 'pt',
			log_level: 'debug',
			out_file: gtfsValidationResultPath,
			rules_path: gtfsValidationRulesPath,
			timeout: GTFS_VALIDATION_TIMEOUT_MS,
		});

		Logger.info({ message: 'Validation completed. Updating GTFS Validation document with results...' });

		// Do not replace a terminal state written while this process was running.
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
		// A successful validator execution is complete even when the feed itself is
		// invalid. Feed errors are domain results, not worker failures.
		//
		// Fetch the user details from the created_by field of the GTFS Validation document
		// to personalize the email content and include a link to the validation detail.

		const updatedGtfsValidation = await goDb.operation.gtfsValidations.findById(gtfsValidation._id);

		if (!updatedGtfsValidation) throw new Error(`GTFS Validation not found after update: ${gtfsValidation._id}`);
		if (!updatedGtfsValidation.created_by) throw new Error(`No creator information found for file: ${gtfsValidation.file_id}`);

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
		// Cleanup failure should be logged without changing an otherwise successful
		// validation into a worker error.

		try {
			fs.rmSync(tempWorkdirPath, { force: true, recursive: true });
			Logger.info({ message: 'Cleaned up temporary files.' });
		} catch (error) {
			Logger.error({ error, message: 'Error during cleanup of temporary files:' });
		}

		//
	} catch (error) {
		// Infrastructure and execution failures become a synthetic system-error
		// summary, distinct from validation errors emitted by the Go binary.
		Logger.error({ error, message: `Error processing GTFS Validation ${gtfsValidation._id}:` });

		// As with completion, preserve any terminal state written concurrently.
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
