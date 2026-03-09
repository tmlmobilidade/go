/* * */

import { getSimplifiedApexValidationCategory, validateIfSimplifiedApexValidationIsPassenger } from '@tmlmobilidade/go-replicator-pckg-parse';
import { simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/**
 * Ensure that Validations have their category and is_passenger fields correctly set.
 * This categorization runs on ingest but in case any records were missed, this task
 * will attempt to categorize Validations that are linked to OnBoardSales but do not
 * yet have a category set.
 */
export async function categorizeValidations() {
	try {
		//

		Logger.init();
		Logger.info('Categorizing Validations...');

		const globalTimer = new Timer();

		let totalValidations = 0;

		//
		// Like Refunds, OnBoard Sales can be linked to Validations by matching
		// the unique CardSerialNumber. In this iteration, we hopefully will only
		// match the remaining transactions that were not linked in the previous iteration.

		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		const allValidationsStream = simplifiedApexValidationsCollection
			.find()
			.sort({ created_at: -1 })
			.stream();

		for await (const validationItem of allValidationsStream) {
			const validationDocument = validationItem as SimplifiedApexValidation;
			// Keep track of total processed Validations
			totalValidations++;
			// Log progress every 10,000 Validations
			if (totalValidations % 10_000 === 0) Logger.info(`Gone through ${totalValidations} Validations so far...`);
			// Fetch the corresponding Validation transaction.
			// If no transaction is found, skip this iteration.
			await simplifiedApexValidations.updateById(validationDocument._id, {
				category: getSimplifiedApexValidationCategory(validationDocument.units_qty, validationDocument.on_board_sale_id),
				is_passenger: validateIfSimplifiedApexValidationIsPassenger(validationDocument.validation_status, validationDocument.event_type, validationDocument.on_board_refund_id),
			});
		}

		Logger.success(`Gone through ${totalValidations} Validations in ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => process.exit(0), 10000); // after 10 seconds
	}
};
