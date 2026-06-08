/* * */

import type { TimeSlot } from '@tmlmobilidade/dates';

import { Dates } from '@tmlmobilidade/dates';

/* * */

const isDevelopment = process.env.ENVIRONMENT === 'development';

export const AppConfig = Object.freeze({
	// Agency and line configurations
	agencyIds: ['41', '42', '43', '44'],

	development: {
		isDevelopment,
		lineIds: [1215],
		timeEnd: Dates.fromUnixTimestamp(1779062400000).plus({ hours: 1 }),
		timeStart: Dates.fromUnixTimestamp(1779062400000),
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
		truncatePipelineTables: isDevelopment ? true : false,
	},
});
