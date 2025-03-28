/* * */

import BRIDGEDB from '@/services/BRIDGEDB.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides } from '@tmlmobilidade/interfaces';
import { Ride } from '@tmlmobilidade/types';
import { getOperationalDate } from '@tmlmobilidade/utils';
import { DateTime } from 'luxon';

/* * */

async function createTableFromExample(rideDataParsed) {
	const createTableQuery = `
        CREATE TABLE IF NOT EXISTS rides (
            ${Object.entries(rideDataParsed).map(([key]) => {
				return `${key} text`;
			}).join(',')}
        );
    `;
	// console.log(createTableQuery);
	await BRIDGEDB.client.query(createTableQuery);
	//
	const createTableIndex = `
        CREATE UNIQUE INDEX IF NOT EXISTS _id_idx ON rides ("_id");
    `;
	await BRIDGEDB.client.query(createTableIndex);
}

/* * */

function parseRide(rideData: Ride) {
	const parsed = {
		_id: rideData._id,
		agency_id: rideData.agency_id,
		end_time_observed: rideData.start_time_observed,
		end_time_scheduled: rideData.end_time_scheduled,
		extension_scheduled: rideData.extension_scheduled,
		line_id: rideData.line_id,
		operational_date: rideData.operational_date,
		pattern_id: rideData.pattern_id,
		plan_id: rideData.plan_id,
		route_id: rideData.route_id,
		start_time_observed: rideData.start_time_observed,
		start_time_scheduled: rideData.start_time_scheduled,
		trip_id: rideData.trip_id,
		validations_count: rideData.validations_count,
	};

	rideData.analysis.forEach((item) => {
		parsed[`${item._id}_grade`] = item.grade;
		parsed[`${item._id}_reason`] = item.reason;
		parsed[`${item._id}_value`] = item.value;
	});

	return parsed;
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
		if (!exampleRide) {
			throw new Error('No example ride found.');
		}

		const rideDataParsed = parseRide(exampleRide);
		await createTableFromExample(rideDataParsed);

		const ridesCollection = await rides.getCollection();

		const todaysOperationalDate = getOperationalDate();

		const todayMinusOneMonthOperationalDate = getOperationalDate(DateTime.now().minus({ months: 1 }));

		const allRidesStream = ridesCollection
			.find({ operational_date: { $gte: todayMinusOneMonthOperationalDate, $lte: todaysOperationalDate } })
			.sort({ operational_date: -1 })
			.stream();

		for await (const rideData of allRidesStream) {
			console.log(`Writing ride "${rideData._id}" ...`);
			const parsedRide = parseRide(rideData);
			try {
				await BRIDGEDB.client.query(`
					INSERT INTO rides (${Object.keys(parsedRide).join(',')})
					VALUES (${Object.values(parsedRide).map(value => `'${value}'`).join(',')})
					ON CONFLICT (_id) DO UPDATE SET ${Object.keys(parsedRide).map(key => `${key} = EXCLUDED.${key}`).join(',')};
					`);
			}
			catch (error) {
				console.log(parsedRide);
				throw new Error(`Error writing ride "${rideData._id}": ${error.message}`);
			}
		}

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);
	}
	catch (err) {
		LOGGER.error('An error occurred. Halting execution.', err);
		LOGGER.info('Retrying in 10 seconds...');
		setTimeout(() => process.exit(1), 10000);
	}
};
