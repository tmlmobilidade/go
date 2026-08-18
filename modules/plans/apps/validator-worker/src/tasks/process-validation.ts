/* * */

import { SYSTEM_ERROR_MESSAGES } from '@/consts/system-errors.js';
import { GTFS_VALIDATION_TIMEOUT_MS } from '@/consts/timeout.js';
import { runValidator } from '@/utils/run-validator/index.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { cleanupValidation } from './cleanup-validation.js';
import { downloadGtfs } from './download-gtfs.js';
import { prepareValidationRules } from './prepare-validation-rules.js';
import { sendValidationResultEmail } from './send-validation-result-email.js';
import { sendValidationSystemErrorEmail } from './send-validation-system-error-email.js';
import { setupPathsForValidation } from './setup-paths-for-validation.js';

/* * */

/** Runs the complete lifecycle for one persisted GTFS validation record. */
export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		// Each run receives its own workspace so its input, rules, and output cannot
		// collide with files produced by another worker instance.
		const { gtfsFilePath, gtfsValidationResultPath, gtfsValidationRulesPath, tempWorkdirPath } = setupPathsForValidation(gtfsValidation);

		Logger.info({ message: `Transitioning GTFS Validation ${gtfsValidation._id} from ${gtfsValidation.processing_status} to processing...` });

		// Match the state observed by the queue poll. For an already-processing
		// record, updated_at also identifies the exact snapshot that was fetched.
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

		// Materialize every external input before starting the native process.
		await downloadGtfs(gtfsValidation, gtfsFilePath);
		await prepareValidationRules(gtfsValidation, gtfsValidationRulesPath);

		Logger.info({ message: `GTFS Validation ${gtfsValidation._id} is processing. Starting the Go validator...` });

		const gtfsValidationSummary = await runValidator(gtfsFilePath, {
			lang: 'pt',
			log_level: 'debug',
			out_file: gtfsValidationResultPath,
			rules_path: gtfsValidationRulesPath,
			timeout: GTFS_VALIDATION_TIMEOUT_MS,
		});

		Logger.info({ message: 'Validation completed. Updating GTFS Validation document with results...' });

		// Only a record that is still processing may receive this result. This stops
		// a late completion from replacing a status changed by another operation.
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

		// Notifications and temporary-file cleanup are deliberately kept outside
		// the persisted result update.
		await sendValidationResultEmail(gtfsValidation, gtfsValidationSummary);
		cleanupValidation(tempWorkdirPath);
	} catch (error) {
		Logger.error({ error, message: `Error processing GTFS Validation ${gtfsValidation._id}:` });

		// Preserve a user-visible summary for infrastructure, download, rules, and
		// native-process failures, but do not overwrite a non-processing record.
		const errorResult = await goDb.operation.gtfsValidations.updateOne({
			_id: gtfsValidation._id,
			processing_status: 'processing',
		}, {
			processing_status: 'error',
			summary: {
				messages: [{
					...SYSTEM_ERROR_MESSAGES.GENERIC_ERROR,
					message: error instanceof Error ? error.message : String(error),
				}],
				total_errors: 1,
				total_warnings: 0,
			},
		}, { returnResult: false });

		if (errorResult.matchedCount === 0) {
			Logger.info({ message: `Ignoring stale error for GTFS Validation ${gtfsValidation._id}.` });
		}

		// Alert delivery is best-effort and handles its own provider errors.
		await sendValidationSystemErrorEmail(error);
	}
}
