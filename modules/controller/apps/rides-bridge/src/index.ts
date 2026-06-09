/* * */

import { BRIDGEDB } from '@/BRIDGEDB.js';
import { FlatRide, parseRide, sampleRide } from '@/types.js';
import { createTableFromExample, dropExistingTable, insertBatch } from '@/utils.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const BATCH_SIZE = 500;

/* * */

export async function syncRides() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'rides-bridge', message: 'Sentry Rides Bridge initialized', module: 'controller', severity: 'info' });
		} catch {
			Logger.error('Error initializing Sentry Rides Bridge');
		}

		Logger.init();
		const globalTimer = new Timer();

		//
		// Prevent syncing if the current minutes are at an exact hour or half-hour,
		// with a minus-2-minute buffer. This is to avoid syncing during
		// the exact times when the BRIDGEDB database is being updated.

		const currentMinutes = Dates.now('utc').toFormat('mm');
		const currentMinutesAsNumber = parseInt(currentMinutes, 10);

		if (currentMinutesAsNumber > 57 && currentMinutesAsNumber < 4) {
			// Do not sync between 57 minutes past the hour and 4 minutes past the next hour.
			Logger.info(`Now is "${currentMinutesAsNumber}" minutes. Syncing is not allowed at this time. Exiting...`);
			return;
		}

		if (currentMinutesAsNumber > 27 && currentMinutesAsNumber < 34) {
			// Do not sync between 27 minutes and 34 minutes past the hour.
			Logger.info(`Now is "${currentMinutesAsNumber}" minutes. Syncing is not allowed at this time. Exiting...`);
			return;
		}

		//
		// Connect to the BRIDGEDB database and drop the existing 'rides' table
		// if it exists. It is easier, faster and more ecological to just delete
		// everything and copy everything again than checking if each individual
		// item is present, updated or orphan in the original MongoDB collection.

		Logger.info('Connecting to databases...');

		await BRIDGEDB.connect();
		const ridesCollection = await rides.getCollection();

		Logger.info('Rebuilding table...');

		await dropExistingTable();
		await createTableFromExample(sampleRide);

		//
		// Fetch rides from the MongoDB collection, parse them, and insert them
		// into the BRIDGEDB database in batches. The rides are fetched from the
		// last month, sorted by operational date in descending order.

		const today = Dates
			.now('Europe/Lisbon')
			.operational_date;

		const oneMonthAgo = Dates
			.now('Europe/Lisbon')
			.minus({ months: 1 })
			.operational_date;

		const stream = ridesCollection
			.find({ operational_date: { $gte: oneMonthAgo, $lte: today } })
			.sort({ operational_date: -1 })
			.stream();

		let batch: FlatRide[] = [];
		let count = 0;

		for await (const ride of stream) {
			batch.push(parseRide(ride));
			if (batch.length >= BATCH_SIZE) {
				await insertBatch(batch);
				Logger.info(`Inserted ${count} rides so far...`);
				count += batch.length;
				batch = [];
			}
		}

		if (batch.length > 0) {
			await insertBatch(batch);
			Logger.info(`Inserted remaining ${batch.length} rides. Total: ${count + batch.length}.`);
		}

		//
		// Disconnect from the BRIDGEDB database
		// and log the total time taken for the operation.

		await BRIDGEDB.disconnect();

		void fetch('https://status.carrismetropolitana.pt/api/push/xdBaFdiO0O42QVTqgp4pZzy66mdhTOYz');

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
		Logger.info('Retrying in 10 seconds...');
		setTimeout(() => process.exit(1), 10000);
	}
}

/* * */

await runOnInterval(syncRides, { intervalMs: '5m' });
