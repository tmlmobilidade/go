/* * */

import type { TimeSlot } from '@tmlmobilidade/dates';

import { Dates } from '@tmlmobilidade/dates';

/* * */

const isProduction = true;// process.env.environment === 'prd';

function getEtaDatabase(): string {
	return isProduction ? 'eta' : 'eta_dev';
}

export const AppConfig = Object.freeze({
	// Agency and line configurations
	agencyIds: ['1', '8', '21', '41', '42', '43', '44'],

	database: getEtaDatabase(),

	development: {
		isDevelopment: !isProduction,
		lineIds: [77],
		timeEnd: Dates.fromUnixTimestamp(1780836960000).plus({ hours: 1 }),
		timeStart: Dates.fromUnixTimestamp(1780836960000),
	},

	// Data and time settings
	historicalDataDaysBack: 30,
	historicalTransformationChunkDays: 1,
	historicalVehicleEventsChunkDays: 2,
	syncInterval: '15m' as TimeSlot,

	// Geometry settings
	shapeNodeChunkLength: 25, // meters

	// Ride start/end event detection settings
	rideEventBufferRadiusMeters: 50, // meters (matches rides-controller BUFFER_RADIUS)
	rideEventDetectionBatchSize: 500, // hist_rides per detect+mutation batch
	rideEventGeohashPrefixLength: 6, // geohash-7 cell + neighbours around each stop
	rideEventWindowPostMs: 10 * 60 * 60 * 1000, // 10h after scheduled start (matches temp.sql window)
	rideEventWindowPreMs: 10 * 60 * 60 * 1000, // 10h before scheduled start (matches temp.sql window)

	// App Pipeline Steps
	pipelineSteps: {
		detectRideStartEndEvents: true,
		insertCurrentWindowRides: true,
		insertCurrentWindowWaypoints: true,
		insertHistoricalRidesByDay: true,
		insertHistoricalShapeNodes: true,
		insertHistoricalVehicleEvents: true,
		runDdl: !isProduction,
		runTransformationAndAggregationQueries: true,
		truncatePipelineTables: !isProduction,
	},
});
