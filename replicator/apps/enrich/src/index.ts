/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { apexOnBoardRefunds, apexOnBoardSales, apexValidations } from '@tmlmobilidade/interfaces';

/* * */

const RUN_INTERVAL = 1800000; // 30 minutes

/* * */

async function enrichApexTransactions() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// The goal is to enrich APEX OnBoard Sales with APEX Validations and APEX OnBoard Refunds data.
		// To accomplish this, we need to start by fetching all validations and refunds data that do not yet
		// have a corresponding OnBoard Sale ID. By doing it this way, we reduce the number of documents
		// we need to process, as we are sure that there is a corresponding OnBoard Sale ID for each
		// validation (of an on-board ticket) and refund document.

		// -----------------

		//
		// Start with Refunds, as they are the smallest collection.
		// Refunds already bring the corresponding OnBoard Sale ID.
		// They can be linked to Validations by matching the CardSerialNumber.
		// All sold on-board tickets have a unique CardSerialNumber value
		// that is present in the Validation transaction.

		const apexOnBoardRefundsCollection = await apexOnBoardRefunds.getCollection();

		const unlinkedOnBoardRefundsBatch = apexOnBoardRefundsCollection
			.find({ validation_transaction_id: { $exists: false } })
			.sort({ created_at: -1 })
			// .limit(1000)
			.stream();

		for await (const onBoardRefund of unlinkedOnBoardRefundsBatch) {
			// Fetch the corresponding Validation transaction.
			// If no transaction is found, skip this iteration.
			const validationTransaction = await apexValidations.findOne({ card_serial_number: onBoardRefund.card_serial_number });
			if (!validationTransaction) continue;
			// Fetch the corresponding OnBoardSale transaction.
			// If no transaction is found, skip this iteration.
			const onBoardSaleTransaction = await apexOnBoardSales.findOne({ _id: onBoardRefund.on_board_sale_transaction_id });
			if (!onBoardSaleTransaction) continue;
			// If both transactions are found, update all three documents with
			// their corresponding IDs and additional information.
			await apexOnBoardRefunds.updateById(onBoardRefund._id,
				{
					line_id: validationTransaction.line_id,
					pattern_id: validationTransaction.pattern_id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_transaction_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			await apexOnBoardSales.updateById(onBoardSaleTransaction._id,
				{
					line_id: validationTransaction.line_id,
					pattern_id: validationTransaction.pattern_id,
					refund_transaction_id: onBoardRefund._id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_transaction_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			await apexValidations.updateById(validationTransaction._id,
				{
					on_board_sale_transaction_id: onBoardSaleTransaction._id,
					refund_transaction_id: onBoardRefund._id,
				},
			);
			//
		}

		// -----------------

		//
		// Next, Sales.
		// Like Refunds, OnBoard Sales can be linked to Validations by matching
		// the unique CardSerialNumber. In this iteration, we hopefully will only
		// match the remaining transactions that were not linked in the previous iteration.

		const apexOnBoardSalesCollection = await apexOnBoardSales.getCollection();

		const unlinkedOnBoardSalesBatch = apexOnBoardSalesCollection
			.find({ validation_transaction_id: { $exists: false } })
			.sort({ created_at: -1 })
			// .limit(1000)
			.stream();

		for await (const onBoardSale of unlinkedOnBoardSalesBatch) {
			// Fetch the corresponding Validation transaction.
			// If no transaction is found, skip this iteration.
			const validationTransaction = await apexValidations.findOne({ card_serial_number: onBoardSale.card_serial_number });
			if (!validationTransaction) continue;
			// If a transaction was found, update both documents with
			// their corresponding IDs and additional information.
			await apexOnBoardSales.updateById(onBoardSale._id,
				{
					line_id: validationTransaction.line_id,
					pattern_id: validationTransaction.pattern_id,
					stop_id: validationTransaction.stop_id,
					trip_id: validationTransaction.trip_id,
					validation_transaction_id: validationTransaction._id,
					vehicle_id: validationTransaction.vehicle_id,
				},
			);
			//
			await apexValidations.updateById(validationTransaction._id,
				{
					on_board_sale_transaction_id: onBoardSale._id,
				},
			);
			//
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

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
		await enrichApexTransactions();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
