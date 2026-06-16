/* * */

import type { TimeSlot } from '@tmlmobilidade/dates';

import { Dates } from '@tmlmobilidade/dates';

/* * */

const isProduction = process.env.ENVIRONMENT === 'production';

function getEtaDatabase(): string {
	return isProduction ? 'eta' : 'eta_dev';
}

export const AppConfig = Object.freeze({
	// Agency and line configurations
	agencyIds: ['1'],

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

	// App Pipeline Steps
	pipelineSteps: {
		insertCurrentWindowRides: true,
		insertCurrentWindowWaypoints: true,
		insertHistoricalRidesByDay: true,
		insertHistoricalShapeNodes: true,
		insertHistoricalVehicleEvents: true,
		runDdl: true,
		runTransformationAndAggregationQueries: true,
		truncatePipelineTables: !isProduction,
	},
});
