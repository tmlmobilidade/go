/* * */

import type { CliArgs } from '@/types.js';
import type { AppConfig } from '@tmlmobilidade/go-eta-pckg-loader';

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const AGENCY_IDS = ['41', '42', '43', '44'];

/**
 * Builds an AppConfig that mirrors the loader app's dev defaults but with the
 * line ids and time window overridden by the analyzer CLI arguments. Bootstrap
 * + truncate are forced on so each run starts from a clean ETA database.
 *
 * The loader's "current window" is what populates `curr_rides`, which in turn
 * is the JOIN target for `mv_curr_vehicle_events`. If that window does not
 * cover the trip's `start_time_scheduled`, no events get snapped into
 * `curr_vehicle_events` and ETAs come back empty. To avoid that pitfall we
 * widen the window to the full operational day of the trip when known.
 */
export function buildLoaderConfig(args: CliArgs): AppConfig {
	let timeStart: Dates;
	let timeEnd: Dates;

	if (args.tripRef.rideId) {
		const dayStart = Dates.fromOperationalDate(args.tripRef.operationalDate, 'Europe/Lisbon');
		timeStart = dayStart;
		timeEnd = dayStart.plus({ days: 1 });
		Logger.info(`Using operational day window from ride id: ${timeStart.iso} → ${timeEnd.iso}`);
	} else {
		timeStart = Dates.fromUnixTimestamp(args.timeStartMs);
		timeEnd = timeStart.plus({ hours: 1 });
		Logger.info(`Using --time-start window: ${timeStart.iso} → ${timeEnd.iso}`);
	}

	return {
		agencyIds: AGENCY_IDS,
		database: 'eta_dev',
		development: {
			isDevelopment: true,
			lineIds: args.lineIds,
			timeEnd,
			timeStart,
		},
		historicalDataDaysBack: 30,
		historicalTransformationChunkDays: 2,
		historicalVehicleEventsChunkDays: 2,
		pipelineSteps: {
			detectRideStartEndEvents: true,
			insertCurrentWindowRides: true,
			insertCurrentWindowWaypoints: true,
			insertHistoricalRidesByDay: true,
			insertHistoricalShapeNodes: true,
			insertHistoricalVehicleEvents: true,
			runDdl: true,
			runTransformationAndAggregationQueries: true,
			truncatePipelineTables: true,
		},
		rideEventBufferRadiusMeters: 50,
		rideEventDetectionBatchSize: 500,
		rideEventGeohashPrefixLength: 6,
		rideEventWindowPostMs: 10 * 60 * 60 * 1000,
		rideEventWindowPreMs: 10 * 60 * 60 * 1000,
		shapeNodeChunkLength: 25,
		syncInterval: '15m',
	};
}
