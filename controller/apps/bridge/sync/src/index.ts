/* * */

import BRIDGEDB from '@/services/BRIDGEDB.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides } from '@tmlmobilidade/interfaces';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

const RUN_INTERVAL = 300_000; // 5 minutes
const BATCH_SIZE = 500;

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

interface FlatRide {

	_id: string
	agency_id: string

	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_grade: string
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_message: null | string
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_reason: null | string
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_unit: null | string
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_value: null | number

	analysis_AT_MOST_TWO_DRIVER_IDS_grade: string
	analysis_AT_MOST_TWO_DRIVER_IDS_message: null | string
	analysis_AT_MOST_TWO_DRIVER_IDS_reason: null | string
	analysis_AT_MOST_TWO_DRIVER_IDS_unit: null | string
	analysis_AT_MOST_TWO_DRIVER_IDS_value: null | number

	analysis_AT_MOST_TWO_VEHICLE_IDS_grade: string
	analysis_AT_MOST_TWO_VEHICLE_IDS_message: null | string
	analysis_AT_MOST_TWO_VEHICLE_IDS_reason: null | string
	analysis_AT_MOST_TWO_VEHICLE_IDS_unit: null | string
	analysis_AT_MOST_TWO_VEHICLE_IDS_value: null | number

	analysis_AVG_INTERVAL_VEHICLE_EVENTS_grade: string
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_message: null | string
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_reason: null | string
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_unit: null | string
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_value: null | number

	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_grade: string
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_message: null | string
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_reason: null | string
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_unit: null | string
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_value: null | number

	analysis_HIGHEST_VEHICLE_EVENT_DELAY_grade: string
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_message: null | string
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_reason: null | string
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_unit: null | string
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_value: null | number

	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_grade: string
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_message: null | string
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_reason: null | string
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_unit: null | string
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_value: null | number

	analysis_MATCHING_LOCATION_TRANSACTIONS_grade: string
	analysis_MATCHING_LOCATION_TRANSACTIONS_message: null | string
	analysis_MATCHING_LOCATION_TRANSACTIONS_reason: null | string
	analysis_MATCHING_LOCATION_TRANSACTIONS_unit: null | string
	analysis_MATCHING_LOCATION_TRANSACTIONS_value: null | number

	analysis_ONTIME_START_grade: string
	analysis_ONTIME_START_message: null | string
	analysis_ONTIME_START_reason: null | string
	analysis_ONTIME_START_unit: null | string
	analysis_ONTIME_START_value: null | number

	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_grade: string
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_message: null | string
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_reason: null | string
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_unit: null | string
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_value: null | number

	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_grade: string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_message: null | string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_reason: null | string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_unit: null | string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_value: null | number

	analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_message: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_unit: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_value: null | number

	analysis_TRANSACTION_SEQUENTIALITY_grade: string
	analysis_TRANSACTION_SEQUENTIALITY_message: null | string
	analysis_TRANSACTION_SEQUENTIALITY_reason: null | string
	analysis_TRANSACTION_SEQUENTIALITY_unit: null | string
	analysis_TRANSACTION_SEQUENTIALITY_value: null | number

	apex_locations_qty: null | number
	apex_on_board_refunds_amount: null | number
	apex_on_board_refunds_qty: null | number
	apex_on_board_sales_amount: null | number
	apex_on_board_sales_qty: null | number
	apex_validations_qty: null | number

	created_at: number
	driver_ids: null | string
	end_time_observed: null | number
	end_time_scheduled: number
	execution_status: null | string
	extension_observed: null | number
	extension_scheduled: number
	hashed_shape_id: string
	hashed_trip_id: string
	headsign: string
	is_locked: boolean
	line_id: string
	ontime_start_value: null | number // Legacy field
	operational_date: string
	passengers_estimated: null | number
	passengers_observed: null | number
	pattern_id: string
	plan_id: string
	route_id: string
	seen_first_at: null | number
	seen_last_at: null | number
	start_time_observed: null | number
	start_time_scheduled: number
	system_status: string
	trip_id: string
	updated_at: number
	validations_count: null | number // Legacy field
	vehicle_ids: null | string
}

/* * */

const sampleRide: FlatRide = {
	_id: 'string',
	agency_id: 'string',
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_grade: 'string',
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_message: 'string',
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_reason: 'string',
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_unit: 'string',
	analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_value: 0,
	analysis_AT_MOST_TWO_DRIVER_IDS_grade: 'string',
	analysis_AT_MOST_TWO_DRIVER_IDS_message: 'string',
	analysis_AT_MOST_TWO_DRIVER_IDS_reason: 'string',
	analysis_AT_MOST_TWO_DRIVER_IDS_unit: 'string',
	analysis_AT_MOST_TWO_DRIVER_IDS_value: 0,
	analysis_AT_MOST_TWO_VEHICLE_IDS_grade: 'string',
	analysis_AT_MOST_TWO_VEHICLE_IDS_message: 'string',
	analysis_AT_MOST_TWO_VEHICLE_IDS_reason: 'string',
	analysis_AT_MOST_TWO_VEHICLE_IDS_unit: 'string',
	analysis_AT_MOST_TWO_VEHICLE_IDS_value: 0,
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_grade: 'string',
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_message: 'string',
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_reason: 'string',
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_unit: 'string',
	analysis_AVG_INTERVAL_VEHICLE_EVENTS_value: 0,
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_grade: 'string',
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_message: 'string',
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_reason: 'string',
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_unit: 'string',
	analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_value: 0,
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_grade: 'string',
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_message: 'string',
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_reason: 'string',
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_unit: 'string',
	analysis_HIGHEST_VEHICLE_EVENT_DELAY_value: 0,
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_grade: 'string',
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_message: 'string',
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_reason: 'string',
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_unit: 'string',
	analysis_LESS_THAN_TEN_VEHICLE_EVENTS_value: 0,
	analysis_MATCHING_LOCATION_TRANSACTIONS_grade: 'string',
	analysis_MATCHING_LOCATION_TRANSACTIONS_message: 'string',
	analysis_MATCHING_LOCATION_TRANSACTIONS_reason: 'string',
	analysis_MATCHING_LOCATION_TRANSACTIONS_unit: 'string',
	analysis_MATCHING_LOCATION_TRANSACTIONS_value: 0,
	analysis_ONTIME_START_grade: 'string',
	analysis_ONTIME_START_message: 'string',
	analysis_ONTIME_START_reason: 'string',
	analysis_ONTIME_START_unit: 'string',
	analysis_ONTIME_START_value: 0,
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_grade: 'string',
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_message: 'string',
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_reason: 'string',
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_unit: 'string',
	analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_value: 0,
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_grade: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_message: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_reason: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_unit: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_value: 0,
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_message: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_unit: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_value: 0,
	analysis_TRANSACTION_SEQUENTIALITY_grade: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_message: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_reason: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_unit: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_value: 0,
	apex_locations_qty: 0,
	apex_on_board_refunds_amount: 0,
	apex_on_board_refunds_qty: 0,
	apex_on_board_sales_amount: 0,
	apex_on_board_sales_qty: 0,
	apex_validations_qty: 0,
	created_at: 0,
	driver_ids: 'string',
	end_time_observed: 0,
	end_time_scheduled: 0,
	execution_status: 'string',
	extension_observed: 0,
	extension_scheduled: 0,
	hashed_shape_id: 'string',
	hashed_trip_id: 'string',
	headsign: 'string',
	is_locked: false,
	line_id: 'string',
	operational_date: 'string',
	passengers_estimated: 0,
	passengers_observed: 0,
	pattern_id: 'string',
	plan_id: 'string',
	route_id: 'string',
	seen_first_at: 0,
	seen_last_at: 0,
	start_time_observed: 0,
	start_time_scheduled: 0,
	system_status: 'string',
	trip_id: 'string',
	updated_at: 0,
	vehicle_ids: 'vehicle1|vehicle2',
	// Legacy fields
	ontime_start_value: 0, // Legacy field
	validations_count: 0, // Legacy field
};

/* * */

function parseRide(ride: Ride): FlatRide {
	return {
		_id: ride._id,
		agency_id: ride.agency_id,
		analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_grade: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.grade ?? null,
		analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_message: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.message ?? null,
		analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_reason: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.reason ?? null,
		analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_unit: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.unit ?? null,
		analysis_AT_LEAST_ONE_EVENT_ON_FIRST_STOP_value: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.value ?? null,
		analysis_AT_MOST_TWO_DRIVER_IDS_grade: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.grade ?? null,
		analysis_AT_MOST_TWO_DRIVER_IDS_message: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.message ?? null,
		analysis_AT_MOST_TWO_DRIVER_IDS_reason: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.reason ?? null,
		analysis_AT_MOST_TWO_DRIVER_IDS_unit: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.unit ?? null,
		analysis_AT_MOST_TWO_DRIVER_IDS_value: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.value ?? null,
		analysis_AT_MOST_TWO_VEHICLE_IDS_grade: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.grade ?? null,
		analysis_AT_MOST_TWO_VEHICLE_IDS_message: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.message ?? null,
		analysis_AT_MOST_TWO_VEHICLE_IDS_reason: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.reason ?? null,
		analysis_AT_MOST_TWO_VEHICLE_IDS_unit: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.unit ?? null,
		analysis_AT_MOST_TWO_VEHICLE_IDS_value: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.value ?? null,
		analysis_AVG_INTERVAL_VEHICLE_EVENTS_grade: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.grade ?? null,
		analysis_AVG_INTERVAL_VEHICLE_EVENTS_message: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.message ?? null,
		analysis_AVG_INTERVAL_VEHICLE_EVENTS_reason: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.reason ?? null,
		analysis_AVG_INTERVAL_VEHICLE_EVENTS_unit: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.unit ?? null,
		analysis_AVG_INTERVAL_VEHICLE_EVENTS_value: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.value ?? null,
		analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_grade: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.grade ?? null,
		analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_message: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.message ?? null,
		analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_reason: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.reason ?? null,
		analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_unit: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.unit ?? null,
		analysis_EXCESSIVE_VEHICLE_EVENT_DELAY_value: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.value ?? null,
		analysis_HIGHEST_VEHICLE_EVENT_DELAY_grade: ride.analysis?.HIGHEST_VEHICLE_EVENT_DELAY?.grade ?? null,
		analysis_HIGHEST_VEHICLE_EVENT_DELAY_message: ride.analysis?.HIGHEST_VEHICLE_EVENT_DELAY?.message ?? null,
		analysis_HIGHEST_VEHICLE_EVENT_DELAY_reason: ride.analysis?.HIGHEST_VEHICLE_EVENT_DELAY?.reason ?? null,
		analysis_HIGHEST_VEHICLE_EVENT_DELAY_unit: ride.analysis?.HIGHEST_VEHICLE_EVENT_DELAY?.unit ?? null,
		analysis_HIGHEST_VEHICLE_EVENT_DELAY_value: ride.analysis?.HIGHEST_VEHICLE_EVENT_DELAY?.value ?? null,
		analysis_LESS_THAN_TEN_VEHICLE_EVENTS_grade: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.grade ?? null,
		analysis_LESS_THAN_TEN_VEHICLE_EVENTS_message: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.message ?? null,
		analysis_LESS_THAN_TEN_VEHICLE_EVENTS_reason: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.reason ?? null,
		analysis_LESS_THAN_TEN_VEHICLE_EVENTS_unit: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.unit ?? null,
		analysis_LESS_THAN_TEN_VEHICLE_EVENTS_value: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.value ?? null,
		analysis_MATCHING_LOCATION_TRANSACTIONS_grade: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.grade ?? null,
		analysis_MATCHING_LOCATION_TRANSACTIONS_message: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.message ?? null,
		analysis_MATCHING_LOCATION_TRANSACTIONS_reason: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.reason ?? null,
		analysis_MATCHING_LOCATION_TRANSACTIONS_unit: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.unit ?? null,
		analysis_MATCHING_LOCATION_TRANSACTIONS_value: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.value ?? null,
		analysis_ONTIME_START_grade: ride.analysis?.ONTIME_START?.grade ?? null,
		analysis_ONTIME_START_message: ride.analysis?.ONTIME_START?.message ?? null,
		analysis_ONTIME_START_reason: ride.analysis?.ONTIME_START?.reason ?? null,
		analysis_ONTIME_START_unit: ride.analysis?.ONTIME_START?.unit ?? null,
		analysis_ONTIME_START_value: ride.analysis?.ONTIME_START?.value ?? null,
		analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_grade: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.grade ?? null,
		analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_message: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.message ?? null,
		analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_reason: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.reason ?? null,
		analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_unit: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.unit ?? null,
		analysis_SIMPLE_ONE_VALIDATION_TRANSACTION_value: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.value ?? null,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_grade: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.grade ?? null,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_message: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.message ?? null,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_reason: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.reason ?? null,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_unit: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.unit ?? null,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_value: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.value ?? null,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade ?? null,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_message: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.message ?? null,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.reason ?? null,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_unit: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.unit ?? null,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_value: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.value ?? null,
		analysis_TRANSACTION_SEQUENTIALITY_grade: ride.analysis?.TRANSACTION_SEQUENTIALITY?.grade ?? null,
		analysis_TRANSACTION_SEQUENTIALITY_message: ride.analysis?.TRANSACTION_SEQUENTIALITY?.message ?? null,
		analysis_TRANSACTION_SEQUENTIALITY_reason: ride.analysis?.TRANSACTION_SEQUENTIALITY?.reason ?? null,
		analysis_TRANSACTION_SEQUENTIALITY_unit: ride.analysis?.TRANSACTION_SEQUENTIALITY?.unit ?? null,
		analysis_TRANSACTION_SEQUENTIALITY_value: ride.analysis?.TRANSACTION_SEQUENTIALITY?.value ?? null,
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
		ontime_start_value: ride.analysis?.ONTIME_START?.value ?? null,
		validations_count: ride.passengers_observed,
	};
}

/* * */

async function insertBatch(batch: FlatRide[]) {
	if (batch.length === 0) return;

	const keys = Object.keys(sampleRide);

	const placeholders = batch
		.map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`)
		.join(', ');

	const values = batch.flatMap(obj => keys.map(k => obj[k] ?? null));

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

		await createTableFromExample(sampleRide);

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
