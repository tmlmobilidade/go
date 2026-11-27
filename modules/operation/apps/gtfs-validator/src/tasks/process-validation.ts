/* * */

import { SYSTEM_ERROR_MESSAGES } from '@/consts/system-errors.js';
import { PAGE_ROUTES, SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { sendSucessfulGtfsValidationEmail, sendSystemErrorEmail, sendUnsuccessfulGtfsValidationEmail } from '@tmlmobilidade/go-providers-emails';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsValidationRule, GtfsValidatorRulesSchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { validateGtfs } from '@tmlmobilidade/go-utils-gtfs-validator';
import { Logger } from '@tmlmobilidade/logger';
import { createWriteStream } from 'node:fs';
import { mkdtempDisposable } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import pjson from 'pjson' with { type: 'json' };

/* * */

export async function processValidation(gtfsValidation: GtfsValidation) {
	try {
		//

		//
		// Check if the GTFS validation has already been attempted 3 times.
		// If so, mark it as 'error' to avoid infinite retries on problematic files.

		if ((gtfsValidation.validation_attempts ?? 0) >= 3) {
			Logger.error({ message: `GTFS Validation ${gtfsValidation._id} has already been attempted 3 times. Marking as error.` });
			await goDb.operation.gtfsValidations.updateById(gtfsValidation._id, {
				processing_status: 'error',
				summary: {
					results: [SYSTEM_ERROR_MESSAGES.MAX_ATTEMPTS_REACHED],
					totals: { errors: 1, infos: 0, warnings: 0 },
				},
			});
			return;
		}

		//
		// Update the GTFS validation document to 'processing' status.

		Logger.info({ message: 'Updating GTFS Validation document...' });

		await goDb.operation.gtfsValidations.updateOne({ _id: gtfsValidation._id }, {
			processing_status: 'processing',
			summary: null,
			validation_attempts: (gtfsValidation.validation_attempts ?? 0) + 1,
			validity_status: 'unknown',
		});

		//
		// Read the agency's saved validation rules.

		const foundAgency = await goDb.core.agencies.findById(gtfsValidation.agency_id);
		if (!foundAgency) throw new Error(`Agency not found: ${gtfsValidation.agency_id}`);
		const rules = GtfsValidatorRulesSchema.parse(foundAgency.plans?.validation_rules ?? []);
		if (!rules.length) throw new Error(`No GTFS validation rules configured for agency: ${gtfsValidation.agency_id}`);

		//
		// Resolve the attachment and let the Go validator import and validate the ZIP.

		const gtfsFile = await storageProvider.findById(gtfsValidation.file_id);
		if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);
		if (!gtfsFile.url) throw new Error(`File URL not found: ${gtfsValidation.file_id}`);
		const summary = await validateAttachment(gtfsFile.url, rules);

		Logger.info({ message: 'Validation completed. Updating GTFS Validation document with results...' });

		await goDb.operation.gtfsValidations.updateById(gtfsValidation._id, {
			processing_status: 'complete',
			summary,
			validity_status: summary.totals.errors === 0 ? 'valid' : 'invalid',
		});

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
				await sendSucessfulGtfsValidationEmail({
					data: {
						firstName: foundUser.first_name,
						gtfsValidationId: gtfsValidation._id,
						gtfsValidationUrl: PAGE_ROUTES.operation.GTFS_VALIDATIONS_DETAIL(gtfsValidation._id),
						totalWarnings: summary.totals.warnings,
					},
					to: foundUser.email,
				});
			} else {
				await sendUnsuccessfulGtfsValidationEmail({
					data: {
						firstName: foundUser.first_name,
						gtfsValidationId: gtfsValidation._id,
						gtfsValidationUrl: PAGE_ROUTES.operation.GTFS_VALIDATIONS_DETAIL(gtfsValidation._id),
						totalErrors: summary.totals.errors,
						totalWarnings: summary.totals.warnings,
					},
					to: foundUser.email,
				});
			}
		} catch (error) {
			Logger.error({ error, message: 'Error sending validation result email:' });
		}

		//
	} catch (error) {
		// If any errors occur during validation, catch them and format
		// a custom error result to be saved in the database and sent via email.
		Logger.error({ error, message: 'Error during GTFS validation:' });
		await goDb.operation.gtfsValidations.updateById(gtfsValidation._id, {
			processing_status: 'error',
			summary: {
				results: [{
					...SYSTEM_ERROR_MESSAGES.GENERIC_ERROR,
					messages: [{
						message: error instanceof Error ? error.message : String(error),
						rows: [],
					}],
				}],
				totals: { errors: 1, infos: 0, warnings: 0 },
			},
		});
		await sendSystemErrorEmail({
			data: {
				errorMessage: error.message ?? 'Unknown error',
				serviceName: pjson.name,
				timestamp: Dates.now('Europe/Lisbon').unix_milliseconds,
			},
			to: SYSTEM_CONTACT_EMAIL,
		});
	}
}

/* * */

async function validateAttachment(url: string, rules: readonly GtfsValidationRule[]) {
	await using directory = await mkdtempDisposable(join(tmpdir(), 'operation-gtfs-validator-'));
	// Storage URLs grant temporary access. Pass only the local path to the CLI logger.
	Logger.info({ message: 'Downloading GTFS file...' });
	const response = await fetch(url);
	if (!response.ok || !response.body) {
		await response.body?.cancel();
		throw new Error(`GTFS download failed with HTTP status ${response.status}`);
	}

	const path = join(directory.path, 'feed.zip');
	await pipeline(response.body, createWriteStream(path));
	Logger.info({ message: 'Validating GTFS file...' });
	return await validateGtfs({ concurrency: 4, rules, signal: AbortSignal.timeout(60 * 60 * 1000), source: { path } });
}
