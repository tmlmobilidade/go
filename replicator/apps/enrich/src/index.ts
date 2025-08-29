/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { getSimplifiedApexValidationCategory, validateIfSimplifiedApexOnBoardSaleIsPassenger, validateIfSimplifiedApexValidationIsPassenger } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { Dates } from '@tmlmobilidade/utils';

/**
 * This function links Refunds with Sales and Validation transactions.
 * It first looks for OnBoardRefund trasactions that doe not yet have a validation_id value,
 * and then finds the corresponding Validation transaction by matching the CardSerialNumber.
 * It updates each transaction with the relevant IDs and additional information.
 * APEX transactions are related to each other in the following way:
 * - OnBoardRefunds already have the corresponding OnBoardSale ID.
 * - OnBoardSales and Validations have a common and unique cardSerialNumber value.
 */
async function linkRefundsToSalesToValidations() {
	try {
		//

		LOGGER.init();
		LOGGER.info('Linking Refunds to Sales and Validations...');

		const globalTimer = new TIMETRACKER();

		let totalUnlinkedOnBoardRefunds = 0;
		let totalLinkedOnBoardRefunds = 0;

		//
		// Refunds are the smallest collection, and they already bring
		// the corresponding OnBoard Sale ID. They can be linked to Validations
		// by matching the CardSerialNumber. All sold on-board tickets have
		// a unique CardSerialNumber value that is present in the Validation transaction.

		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();

		const unlinkedOnBoardRefundsBatch = simplifiedApexOnBoardRefundsCollection
			.find({ validation_id: null })
			.sort({ created_at: -1 })
			// .limit(5000)
			.stream();

		for await (const onBoardRefund of unlinkedOnBoardRefundsBatch) {
			totalUnlinkedOnBoardRefunds++;
			if (totalUnlinkedOnBoardRefunds % 10000 === 0) LOGGER.info(`Gone through ${totalUnlinkedOnBoardRefunds} Refunds so far and linked ${totalLinkedOnBoardRefunds} of them to Sales and Validations.`);
			// Fetch the corresponding Validation transaction.
			// If no transaction is found, skip this iteration.
			const validationTransaction = await simplifiedApexValidations.findOne({ card_serial_number: onBoardRefund.card_serial_number });
			if (!validationTransaction) continue;
			// Fetch the corresponding OnBoardSale transaction.
			// If no transaction is found, skip this iteration.
			const onBoardSaleTransaction = await simplifiedApexOnBoardSales.findOne({ _id: onBoardRefund.on_board_sale_id });
			if (!onBoardSaleTransaction) continue;
			// If both transactions are found, update all three documents with
			// their corresponding IDs and additional information.
			await simplifiedApexValidations.updateById(validationTransaction._id,
				{
					category: getSimplifiedApexValidationCategory(validationTransaction.units_qty, onBoardSaleTransaction._id),
					is_passenger: validateIfSimplifiedApexValidationIsPassenger(validationTransaction.validation_status, validationTransaction.event_type, onBoardRefund._id),
					on_board_refund_id: onBoardRefund._id,
					on_board_sale_id: onBoardSaleTransaction._id,
				},
			);
			//
			await simplifiedApexOnBoardSales.updateById(onBoardSaleTransaction._id,
				{
					is_passenger: validateIfSimplifiedApexOnBoardSaleIsPassenger(onBoardRefund._id),
					line_id: validationTransaction.line_id,
					on_board_refund_id: onBoardRefund._id,
					pattern_id: validationTransaction.pattern_id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			await simplifiedApexOnBoardRefunds.updateById(onBoardRefund._id,
				{
					line_id: validationTransaction.line_id,
					pattern_id: validationTransaction.pattern_id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			const standardWindowInterval = Dates.fromUnixTimestamp(onBoardRefund.created_at).std_window;
			await rides.updateMany(
				{
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: onBoardRefund.trip_id,
				},
				{ system_status: 'waiting' },
				{ returnResults: false },
			);
			//
			totalLinkedOnBoardRefunds++;
			//
		}

		//

		LOGGER.success(`Linked ${totalLinkedOnBoardRefunds} out of ${totalUnlinkedOnBoardRefunds} OnBoardRefunds in ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		},
		10000); // after 10 seconds
	}

	//
};

/**
 * This function links Sales with Validation transactions.
 * This function should be run after the linkRefundsToSalesToValidations function,
 * as it relies on the Sales already being linked to Refunds when they exist.
 * The function looks for OnBoardSales that do not yet have a validation_id value,
 * and then finds the corresponding Validation transaction by matching the CardSerialNumber.
 * It updates each transaction with the relevant IDs and additional information.
 */
async function linkSalesToValidations() {
	try {
		//

		LOGGER.init();
		LOGGER.info('Linking Sales to Validations...');

		const globalTimer = new TIMETRACKER();

		let totalUnlinkedOnBoardSales = 0;
		let totalLinkedOnBoardSales = 0;

		//
		// Like Refunds, OnBoard Sales can be linked to Validations by matching
		// the unique CardSerialNumber. In this iteration, we hopefully will only
		// match the remaining transactions that were not linked in the previous iteration.

		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();

		const unlinkedOnBoardSalesBatch = simplifiedApexOnBoardSalesCollection
			.find({ validation_id: null })
			.sort({ created_at: -1 })
			// .limit(5000)
			.stream();

		for await (const onBoardSale of unlinkedOnBoardSalesBatch) {
			totalUnlinkedOnBoardSales++;
			if (totalUnlinkedOnBoardSales % 10000 === 0) LOGGER.info(`Gone through ${totalUnlinkedOnBoardSales} OnBoardSales so far and linked ${totalLinkedOnBoardSales} of them to Validations.`);
			// Fetch the corresponding Validation transaction.
			// If no transaction is found, skip this iteration.
			const validationTransaction = await simplifiedApexValidations.findOne({ card_serial_number: onBoardSale.card_serial_number });
			if (!validationTransaction) continue;
			// If a transaction was found, update both documents with
			// their corresponding IDs and additional information.
			await simplifiedApexValidations.updateById(validationTransaction._id,
				{
					category: getSimplifiedApexValidationCategory(validationTransaction.units_qty, onBoardSale._id),
					is_passenger: validateIfSimplifiedApexValidationIsPassenger(validationTransaction.validation_status, validationTransaction.event_type, null),
					on_board_sale_id: onBoardSale._id,
				},
			);
			//
			await simplifiedApexOnBoardSales.updateById(onBoardSale._id,
				{
					is_passenger: validateIfSimplifiedApexOnBoardSaleIsPassenger(null),
					line_id: validationTransaction.line_id,
					pattern_id: validationTransaction.pattern_id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			const standardWindowInterval = Dates.fromUnixTimestamp(onBoardSale.created_at).std_window;
			await rides.updateMany(
				{
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: validationTransaction.trip_id,
				},
				{ system_status: 'waiting' },
				{ returnResults: false },
			);
			//
			totalLinkedOnBoardSales++;
			//
		}

		//

		LOGGER.success(`Linked ${totalLinkedOnBoardSales} out of ${totalUnlinkedOnBoardSales} OnBoardSales in ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		},
		10000); // after 10 seconds
	}

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await linkRefundsToSalesToValidations();
		await linkSalesToValidations();
		setTimeout(runOnInterval, 60_000); // 60 seconds
	};
	runOnInterval();
})();
