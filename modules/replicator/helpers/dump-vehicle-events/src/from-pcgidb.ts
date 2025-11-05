/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { PCGIDB } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { Dates } from '@go/utils-dates';
import fs from 'node:fs';

/* * */

export async function dumpVehicleEventsFromPCGIDB() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases and setup DB writers

		await PCGIDB.connect();

		/* * * * * * * * * * * * * * * * */
		/* * * SETUP YOUR QUERY HERE * * */
		/* * *                       * * */

		const startDateUnixTimestamp = Dates
			.now('Europe/Lisbon')
			.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 7, second: 0, year: 2025 })
			.unix_timestamp;

		const endDateUnixTimestamp = Dates
			.now('Europe/Lisbon')
			.set({ day: 2, hour: 4, millisecond: 0, minute: 0, month: 7, second: 0, year: 2025 })
			.unix_timestamp;

		const query = {
			'content.entity.vehicle.trip.tripId': '3510_0_1_2300_2329_0_VER_DU',
			'millis': { $gte: startDateUnixTimestamp, $lt: endDateUnixTimestamp },
		};

		/* * * * * * * * * * * * * * * * */
		/* * * * * * * * * * * * * * * * */

		//
		// Perform the lookup

		const vehicleEventsFromPCGIDB = await PCGIDB.VehicleEvents.find(query).toArray();

		//
		// Save the results to a JSON file

		const jsonData = JSON.stringify(vehicleEventsFromPCGIDB, null, 2);

		if (!fs.existsSync('output')) fs.mkdirSync('output');

		fs.writeFileSync(`output/events-${startDateUnixTimestamp}-${endDateUnixTimestamp}.json`, jsonData);

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
