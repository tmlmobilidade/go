/* * */

import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride, validateOperationalDate } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/* * */

export async function dumpRidesFromSaeDb() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup DB writers

		const collection = await rides.getCollection();

		/* * * * * * * * * * * * * * * * */
		/* * * SETUP YOUR QUERY HERE * * */
		/* * *                       * * */

		const query = {
			operational_date: { $gte: validateOperationalDate('20251013'), $lte: validateOperationalDate('20251019') },
		};

		/* * * * * * * * * * * * * * * * */
		/* * * * * * * * * * * * * * * * */

		//
		// Perform the lookup

		if (!fs.existsSync('output')) fs.mkdirSync('output');

		const csvWriter = new CsvWriter('output', `output/rides-20251013-20251019.csv`, { batch_size: 100000 });

		const totalCount = await collection.countDocuments(query);

		Logger.info(`Total records to process: ${totalCount}`);

		//

		let counter = 0;

		const stream = collection.find(query).stream();

		console.log('Starting data extraction...');

		for await (const doc of stream) {
			// Enforce type
			const data: Ride = doc;
			// Save anonymized data
			await csvWriter.write({
				_id: data._id,
				agency_id: data.agency_id,
				apex_on_board_refunds_amount: data.apex_on_board_refunds_amount,
				apex_on_board_refunds_qty: data.apex_on_board_refunds_qty,
				apex_on_board_sales_amount: data.apex_on_board_sales_amount,
				apex_on_board_sales_qty: data.apex_on_board_sales_qty,
				apex_validations_qty: data.apex_validations_qty,
				end_time_observed: data.end_time_observed,
				end_time_scheduled: data.end_time_scheduled,
				extension_observed: data.extension_observed,
				extension_scheduled: data.extension_scheduled,
				headsign: data.headsign,
				line_id: data.line_id,
				operational_date: data.operational_date,
				passengers_observed: data.passengers_observed,
				passengers_observed_on_board_sales_amount: data.passengers_observed_on_board_sales_amount,
				passengers_observed_on_board_sales_qty: data.passengers_observed_on_board_sales_qty,
				passengers_observed_prepaid_amount: data.passengers_observed_prepaid_amount,
				passengers_observed_prepaid_qty: data.passengers_observed_prepaid_qty,
				passengers_observed_subscription_qty: data.passengers_observed_subscription_qty,
				pattern_id: data.pattern_id,
				seen_first_at: data.seen_first_at,
				seen_last_at: data.seen_last_at,
				start_time_observed: data.start_time_observed,
				start_time_scheduled: data.start_time_scheduled,
				trip_id: data.trip_id,
				vehicle_ids: data.vehicle_ids.join('|'),
			});
			// Log progress every 100000 records
			if (counter % 100000 === 0) Logger.info(`Processed ${counter} records so far...`);
			counter++;
		}

		await csvWriter.flush();

		//
		// Save the results to a JSON file

		// const textData = Papa.unparse(finalOutput);

		// fs.writeFileSync(`output/apex-validations-${startDateUnixTimestamp}-${endDateUnixTimestamp}.csv`, textData);

		//

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};
