/* * */

import { GOClickHouseClient, queryFromFile, queryFromString } from '@tmlmobilidade/databases';
import { Dates, TimeSlot } from '@tmlmobilidade/dates';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection } from '@tmlmobilidade/geo';
import { Filter, hashedShapes } from '@tmlmobilidade/interfaces';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride } from '@tmlmobilidade/types';
import { BatchWriter, runOnInterval } from '@tmlmobilidade/utils';
import geohash from 'ngeohash';
import path from 'node:path';

/* * */

const SYNC_INTERVAL: TimeSlot = '15m';
const HISTORICAL_DATA_DAYS_BACK: number = 30;

const AGENCY_IDS = ['41', '42', '43', '44'];
const SHAPE_NODE_CHUNK_LENGTH = 25; // meters
const DEV_LINE_IDS = [2652, 2708, 2711, 2713, 2722, 2725, 2728, 2729, 2730, 2731, 2734];

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

/* * */

/**
 * Resolves to `modules/eta/sql/`, regardless of whether this file runs from
 * `src/` (dev via tsx) or `dist/` (compiled). Both paths share the same depth
 * relative to the eta module root.
 */
const SQL_ROOT = path.resolve(__dirname, '..', '..', '..', 'sql');

/**
 * Returns the absolute path to a pipeline `.sql` file shipped with the eta
 * module. Pass it directly to `queryFromFile()` from `@tmlmobilidade/databases`.
 *
 * @example
 * await queryFromFile(client, pipelinePath('transformation'));
 */
function pipelinePath(name: string): string {
	return path.join(SQL_ROOT, name);
}

/**
 * Builds and persists shape nodes for rides matching `ridesQuery`.
 *
 * Fetches distinct `hashed_shape_id` values from `rides`, loads each shape,
 * chunks its geometry by `chunkLength` (meters), and writes every chunk point
 * to clickhouse table `eta.hist_shape_nodes` with `shape_id` and `node_index`.
 *
 * Returns total number of shape nodes processed and written.
 */
export async function syncShapeNodes(clickhouseClient, hashedShapeIds: string[]): Promise<{ shapeNodesProcessed: number }> {
	//

	//
	// Setup ClickHouse writer
	const writer = new BatchWriter({
		batch_size: 10_000,
		insertFn: async (data) => {
			await clickhouseClient.insert({
				format: 'JSONEachRow',
				table: 'eta.hist_shape_nodes',
				values: data,
			});
		},
		title: 'eta.hist_shape_nodes',
	});

	//
	// Get distinct hashed shape ids from rides
	Logger.info(`Getting distinct hashed shape ids from rides`);
	const hashedShapesCollection = await hashedShapes.getCollection();

	//
	// Get hashed shapes cursor
	const hashedShapesCursor = hashedShapesCollection.find(
		{ _id: { $in: hashedShapeIds } },
		{ projection: { _id: 1, points: { shape_pt_lat: 1, shape_pt_lon: 1 } } },
	).batchSize(10_000).stream();

	//
	// Create shape nodes for each hashed shape
	Logger.info(`Creating shape nodes for ${hashedShapeIds.length} hashed shape ids`);

	let shapeNodesProcessed = 0;
	for await (const hashedShape of hashedShapesCursor) {
		const geojson = hashedShapesToFeatureCollection(hashedShape);
		const chunks = chunkLineByDistanceV2(geojson.features[0].geometry, SHAPE_NODE_CHUNK_LENGTH);

		for (const [idx, chunk] of chunks.coordinates.entries()) {
			shapeNodesProcessed++;
			await writer.write({
				geohash: geohash.encode(chunk[1], chunk[0], 7),
				latitude: chunk[1],
				longitude: chunk[0],
				node_index: idx,
				shape_id: hashedShape._id,
			});
		}
	}

	//
	// Flush writer
	await writer.flush();

	//
	// Return total number of shape nodes processed and written
	return { shapeNodesProcessed };
}

async function main() {
	//

	Logger.init();
	const globalTimer = new Timer();
	const clickhouseClient = await GOClickHouseClient.getClient();

	//
	// Get Current Window Rides

	const ridesQuery: Filter<Ride> = {
		agency_id: { $in: AGENCY_IDS },
		end_time_observed: { $ne: null },
		line_id: { $in: DEV_LINE_IDS }, // ! Development only: restrict to a hand-picked set of lines
	};

	Logger.progress(`Getting current window rides for date range: ${Dates.now('Europe/Lisbon').minus({ hours: 1 }).iso} → ${Dates.now('Europe/Lisbon').plus({ hours: 1 }).iso}`);

	const currentWindowRides = await rides.aggregate([
		{ $match: {
			...ridesQuery,
			start_time_scheduled: {
				$gte: Dates.now('Europe/Lisbon').minus({ hours: 1 }).unix_timestamp,
				$lte: Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp,
			},
		} },
		{ $sort: { start_time_scheduled: 1 } },
	]);

	Logger.progress(`Found ${currentWindowRides.length} current window rides`);

	// Insert currentWindowRides into clickhouse, _id, trip_id, hashed_shape_id
	Logger.progress(`Inserting ${currentWindowRides.length} current window rides into clickhouse`);
	await clickhouseClient.insert({
		format: 'JSONEachRow',
		table: 'eta.curr_rides',
		values: currentWindowRides.map(ride => ({
			_id: ride._id,
			end_time_observed: ride.end_time_observed,
			hashed_shape_id: ride.hashed_shape_id,
			hashed_trip_id: ride.hashed_trip_id,
			start_time_observed: ride.start_time_observed,
			start_time_scheduled: ride.start_time_scheduled,
			trip_id: ride.trip_id,
		})),
	});

	//
	// Get Historical Rides

	const disctictHashedShapeIds = new Set<string>();
	Logger.progress(`Getting historical rides for date range: ${Dates.now('Europe/Lisbon').minus({ days: HISTORICAL_DATA_DAYS_BACK }).iso} → ${Dates.now('Europe/Lisbon').iso}`);
	for (let index = 0; index < HISTORICAL_DATA_DAYS_BACK; index++) {
		//

		const start = Dates.now('Europe/Lisbon').minus({ days: index, hours: 1 });
		const end = Dates.now('Europe/Lisbon').minus({ days: index }).plus({ hours: 1 });

		Logger.progress(`Getting historical rides for date range: ${start.iso} → ${end.iso}`);

		const historicalRides = await rides.aggregate([
			{ $match: {
				...ridesQuery,
				start_time_scheduled: {
					$gte: start.unix_timestamp,
					$lte: end.unix_timestamp,
				},
			} },
			{ $sort: { start_time_scheduled: 1 } },
		]);

		historicalRides.forEach((ride) => {
			disctictHashedShapeIds.add(ride.hashed_shape_id);
		});

		Logger.progress(`Found ${historicalRides.length} historical rides`);

		// Insert into clickhouse, _id, trip_id, hashed_shape_id
		Logger.progress(`Inserting ${historicalRides.length} historical rides into clickhouse`);
		await clickhouseClient.insert({
			format: 'JSONEachRow',
			table: 'eta.hist_rides',
			values: historicalRides.map(ride => ({
				_id: ride._id,
				end_time_observed: ride.end_time_observed,
				hashed_shape_id: ride.hashed_shape_id,
				hashed_trip_id: ride.hashed_trip_id,
				start_time_observed: ride.start_time_observed,
				start_time_scheduled: ride.start_time_scheduled,
				trip_id: ride.trip_id,
			})),
		});
	}

	//
	// Insert historical rides vehicle events
	Logger.progress(`Inserting historical rides vehicle events into clickhouse`);
	const result = await queryFromString(clickhouseClient, `
		INSERT INTO eta.hist_vehicle_events
		SELECT
			sve._id,
			sve.created_at,
			sve.agency_id,
			hr._id AS ride_id,
			sve.trip_id,
			hr.hashed_shape_id,
			sve.latitude,
			sve.longitude,
			sve.vehicle_id
		FROM
		(
			SELECT _id, created_at, agency_id, trip_id, latitude, longitude, vehicle_id
			FROM operation.simplified_vehicle_events
			WHERE created_at >= (SELECT min(greatest(start_time_observed, start_time_scheduled)) FROM eta.hist_rides)
			AND created_at <= (SELECT max(end_time_observed) FROM eta.hist_rides)
		) AS sve
		INNER JOIN eta.hist_rides AS hr
			ON sve.trip_id = hr.trip_id
		AND sve.created_at >= greatest(hr.start_time_observed, hr.start_time_scheduled)
		AND sve.created_at <= hr.end_time_observed
		LEFT ANTI JOIN eta.hist_vehicle_events hve
			ON sve._id = hve._id;
	`);

	Logger.progress(`Inserted ${result} historical rides vehicle events into clickhouse`);

	//
	// Sync historical shape nodes

	Logger.progress(`Syncing historical shape nodes`);
	await syncShapeNodes(clickhouseClient, Array.from(disctictHashedShapeIds));

	//
	// Run Transformatino Pipeline
	Logger.progress(`Syncing historical node travel times`);
	await queryFromFile(clickhouseClient, pipelinePath('1-transformation.sql'));

	//
	//

	Logger.success(`Loader completed in ${globalTimer.get()} seconds`);
}

/* * */

await runOnInterval(main, { intervalMs: SYNC_INTERVAL });
