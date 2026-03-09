/* * */

import { Dates } from '@tmlmobilidade/dates';
import { pcgidbLegacy } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/* * */

export async function dumpVehicleEventsFromPCGIDB() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup DB writers

		await pcgidbLegacy.connect();

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
			// 'content.entity.vehicle.trip.tripId': '3510_0_1_2300_2329_0_VER_DU',
			millis: { $gte: startDateUnixTimestamp, $lt: endDateUnixTimestamp },
		};

		/* * * * * * * * * * * * * * * * */
		/* * * * * * * * * * * * * * * * */

		//
		// Perform the lookup

		const stream = pcgidbLegacy.VehicleEvents.find(query).stream();

		//
		// Save the results to a JSON file

		const veWriter = new CsvWriter('vehicle-events', 'output/events.csv');

		for await (const doc of stream) {
			//

			veWriter.write(doc);

			//
		}

		veWriter.flush();

		// const jsonData = JSON.stringify(vehicleEventsFromPCGIDB, null, 2);

		// if (!fs.existsSync('output')) fs.mkdirSync('output');

		// fs.writeFileSync(`output/events-${startDateUnixTimestamp}-${endDateUnixTimestamp}.json`, jsonData);

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
