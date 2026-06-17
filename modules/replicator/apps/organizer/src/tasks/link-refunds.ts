/* * */

import { Dates } from '@tmlmobilidade/dates';
import { getSimplifiedApexValidationCategory, validateIfSimplifiedApexOnBoardSaleIsPassenger, validateIfSimplifiedApexValidationIsPassenger } from '@tmlmobilidade/go-replicator-pckg-parse';
import { rides, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * This function links Refunds with Sales and Validation transactions.
 * It first looks for OnBoardRefund trasactions that doe not yet have a validation_id value,
 * and then finds the corresponding Validation transaction by matching the CardSerialNumber.
 * It updates each transaction with the relevant IDs and additional information.
 * APEX transactions are related to each other in the following way:
 * - OnBoardRefunds already have the corresponding OnBoardSale ID.
 * - OnBoardSales and Validations have a common and unique cardSerialNumber value.
 */
export async function linkRefundsToSalesToValidations() {
	try {
		//

		Logger.init();
		Logger.info({ message: 'Linking Refunds to Sales and Validations...' });

		const globalTimer = new Timer();

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
			if (totalUnlinkedOnBoardRefunds % 10000 === 0) Logger.info({ message: `Gone through ${totalUnlinkedOnBoardRefunds} Refunds so far and linked ${totalLinkedOnBoardRefunds} of them to Sales and Validations.` });
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

		Logger.success(`Linked ${totalLinkedOnBoardRefunds} out of ${totalUnlinkedOnBoardRefunds} OnBoardRefunds in ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => process.exit(1), 10000); // after 10 seconds
	}
};
