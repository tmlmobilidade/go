/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { CsvWriter } from '@helperkits/writer';
import { vehicleEvents } from '@tmlmobilidade/interfaces';
import { VehicleEvent } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';
import fs from 'node:fs';

/* * */

export async function dumpVehicleEventsFromSaeDb() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases and setup DB writers

		const collection = await vehicleEvents.getCollection();

		/* * * * * * * * * * * * * * * * */
		/* * * SETUP YOUR QUERY HERE * * */
		/* * *                       * * */

		const startDateUnixTimestamp = Dates
			.now('Europe/Lisbon')
			.set({ day: 13, hour: 4, millisecond: 0, minute: 0, month: 10, second: 0, year: 2025 })
			.unix_timestamp;

		const endDateUnixTimestamp = Dates
			.now('Europe/Lisbon')
			.set({ day: 20, hour: 4, millisecond: 0, minute: 0, month: 10, second: 0, year: 2025 })
			.unix_timestamp;

		const query = {
			created_at: { $gte: startDateUnixTimestamp, $lt: endDateUnixTimestamp },
		};

		/* * * * * * * * * * * * * * * * */
		/* * * * * * * * * * * * * * * * */

		//
		// Perform the lookup

		if (!fs.existsSync('output')) fs.mkdirSync('output');

		const csvWriter = new CsvWriter('output', `output/vehicle-events-${startDateUnixTimestamp}-${endDateUnixTimestamp}.csv`, { batch_size: 100000 });

		const totalCount = await collection.countDocuments(query);

		LOGGER.info(`Total records to process: ${totalCount}`);

		//

		let counter = 0;

		const driverIds: Record<string, string> = {};

		const stream = collection.find(query).limit(1000).stream();

		console.log('Starting data extraction...');

		for await (const doc of stream) {
			// Enforce type
			const data: VehicleEvent = doc;
			// Anonymize driver ID
			if (!driverIds[data.driver_id]) {
				driverIds[data.driver_id] = generateRandomString();
			}
			// Save anonymized data
			await csvWriter.write({
				_id: data._id,
				agency_id: data.agency_id,
				created_at: data.created_at,
				driver_id: driverIds[data.driver_id],
				extra_trip_id: data.extra_trip_id,
				latitude: data.latitude,
				longitude: data.longitude,
				odometer: data.odometer,
				pattern_id: data.pattern_id,
				received_at: data.received_at,
				stop_id: data.stop_id,
				trigger_door: data.trigger_door,
				trip_id: data.trip_id,
				vehicle_id: data.vehicle_id,
			});
			// Log progress every 100000 records
			if (counter % 100000 === 0) LOGGER.info(`Processed ${counter} records so far...`);
			counter++;
		}

		await csvWriter.flush();

		//
		// Save the results to a JSON file

		// const textData = Papa.unparse(finalOutput);

		// fs.writeFileSync(`output/apex-validations-${startDateUnixTimestamp}-${endDateUnixTimestamp}.csv`, textData);

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

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
