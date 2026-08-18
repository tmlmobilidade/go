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

export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		const { gtfsFilePath, gtfsValidationResultPath, gtfsValidationRulesPath, tempWorkdirPath } = setupPathsForValidation(gtfsValidation);

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

		await sendValidationResultEmail(gtfsValidation, gtfsValidationSummary);
		cleanupValidation(tempWorkdirPath);
	} catch (error) {
		Logger.error({ error, message: `Error processing GTFS Validation ${gtfsValidation._id}:` });

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

		await sendValidationSystemErrorEmail(error);
	}
}
