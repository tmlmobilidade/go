/* * */

import BRIDGEDB from '@/services/BRIDGEDB.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides } from '@tmlmobilidade/interfaces';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

const RUN_INTERVAL = 3600000; // 60 minutes
const BATCH_SIZE = 100;

/* * */

function detectType(value): string {
	if (typeof value === 'number') return 'numeric';
	if (typeof value === 'boolean') return 'boolean';
	return 'text';
}

/* * */

async function createTableFromExample(rideDataParsed) {
	const createTableQuery = `
        CREATE TABLE IF NOT EXISTS rides (
            ${Object.entries(rideDataParsed)
				.map(([key]) => `"${key}" ${detectType(rideDataParsed[key])}`)
				.join(',')}
        );
    `;
	await BRIDGEDB.client.query(createTableQuery);
	const createIndexQuery = `
		CREATE UNIQUE INDEX IF NOT EXISTS _id_idx ON rides ("_id");
    `;
	await BRIDGEDB.client.query(createIndexQuery);
}

/* * */

function parseRide(ride: Ride): Record<string, boolean | null | number | string> {
	const base = {
		_id: ride._id,
		agency_id: ride.agency_id,
		apex_locations_qty: ride.apex_locations_qty,
		apex_on_board_refunds_amount: ride.apex_on_board_refunds_amount,
		apex_on_board_refunds_qty: ride.apex_on_board_refunds_qty,
		apex_on_board_sales_amount: ride.apex_on_board_sales_amount,
		apex_on_board_sales_qty: ride.apex_on_board_sales_qty,
		apex_validations_qty: ride.apex_validations_qty,
		created_at: ride.created_at,
		driver_ids: (ride.driver_ids ?? []).join('|'),
		end_time_observed: ride.end_time_observed,
		end_time_scheduled: ride.end_time_scheduled,
		execution_status: ride.execution_status ?? '',
		extension_observed: ride.extension_observed,
		extension_scheduled: ride.extension_scheduled,
		hashed_shape_id: ride.hashed_shape_id,
		hashed_trip_id: ride.hashed_trip_id,
		headsign: ride.headsign,
		is_locked: ride.is_locked,
		line_id: ride.line_id,
		operational_date: ride.operational_date,
		passengers_estimated: ride.passengers_estimated,
		passengers_observed: ride.passengers_observed,
		pattern_id: ride.pattern_id,
		plan_id: ride.plan_id,
		route_id: ride.route_id,
		seen_first_at: ride.seen_first_at,
		seen_last_at: ride.seen_last_at,
		start_time_observed: ride.start_time_observed,
		start_time_scheduled: ride.start_time_scheduled,
		system_status: ride.system_status,
		trip_id: ride.trip_id,
		updated_at: ride.updated_at,
		vehicle_ids: (ride.vehicle_ids ?? []).join('|'),
		// Legacy fields
		validations_count: ride.apex_validations_qty,
	};

	const analysisFields: Record<string, number | string> = {};

	for (const [key, val] of Object.entries(ride.analysis ?? {})) {
		const safeKey = key.toLowerCase();
		analysisFields[`${safeKey}_grade`] = val.grade;
		// analysisFields[`${safeKey}_message`] = val.message;
		analysisFields[`${safeKey}_reason`] = val.reason;
		analysisFields[`${safeKey}_unit`] = val.unit;
		analysisFields[`${safeKey}_value`] = val.value;
	}

	return {
		...base,
		...analysisFields,
	};
}

/* * */

async function insertBatch(batch: ReturnType<typeof parseRide>[]) {
	if (batch.length === 0) return;

	const keys = Object.keys(batch[0]);

	const placeholders = batch
		.map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`)
		.join(', ');

	const values = batch.flatMap(obj => keys.map(k => obj[k]));

	const query = `
        INSERT INTO rides (${keys.map(k => `"${k}"`).join(', ')})
        VALUES ${placeholders}
        ON CONFLICT (_id) DO UPDATE SET ${keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')};
    `;

	await BRIDGEDB.client.query(query, values);
}

/* * */

export async function syncRides() {
	try {
		LOGGER.init();
		const globalTimer = new TIMETRACKER();

		LOGGER.info('Connecting to databases...');
		await BRIDGEDB.connect();

		LOGGER.divider();
		LOGGER.info('Creating ride table...');

		const exampleRide = await rides.findOne({ system_status: 'complete' });
		if (!exampleRide) throw new Error('No example ride found.');
		await createTableFromExample(parseRide(exampleRide));

		const ridesCollection = await rides.getCollection();

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

		let batch = [];
		let count = 0;

		for await (const ride of stream) {
			batch.push(parseRide(ride));
			count++;

			if (batch.length >= BATCH_SIZE) {
				await insertBatch(batch);
				LOGGER.info(`Inserted ${count} rides so far...`);
				batch = [];
			}
		}

		if (batch.length > 0) {
			await insertBatch(batch);
			LOGGER.info(`Inserted remaining ${batch.length} rides.`);
		}

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);
	}
	catch (err) {
		LOGGER.error('An error occurred. Halting execution.', err);
		LOGGER.info('Retrying in 10 seconds...');
		setTimeout(() => process.exit(1), 10000);
	}
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await syncRides();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
