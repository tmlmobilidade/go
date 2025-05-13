/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { apexOnBoardRefunds, apexOnBoardSales, apexValidations } from '@tmlmobilidade/interfaces';

/* * */

export async function enrichApexOnBoardSales() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases

		const apexOnBoardSalesCollection = await apexOnBoardSales.getCollection();
		const apexOnBoardRefundsCollection = await apexOnBoardRefunds.getCollection();
		const apexValidationsCollection = await apexValidations.getCollection();

		//
		// The goal is to enrich APEX OnBoard Sales with APEX Validations and APEX OnBoard Refunds data.
		// To accomplish this, we need to start by fetching all validations and refunds data that do not yet
		// have a corresponding OnBoard Sale ID. By doing it this way, we reduce the number of documents
		// we need to process, as we are sure that there is a corresponding OnBoard Sale ID for each
		// validation (of an on-board ticket) and refund document.

		const unlinkedOnBoardRefunds = apexOnBoardRefundsCollection
			.find({ on_board_sale_transaction_id: { $exists: false } })
			.limit(1000)
			.toArray();

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
