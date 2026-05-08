import type { TimeSlot } from '@tmlmobilidade/dates';

const isDevelopment = false; // process.env.ENVIRONMENT === 'development';

export const AppConfig = Object.freeze({
	// Agency and line configurations
	agencyIds: ['41', '42', '43', '44'],
	devLineIds: [2652, 2708, 2711, 2713, 2722, 2725, 2728, 2729, 2730, 2731, 2734],
	useDevLineIds: isDevelopment ? true : false,

	// Data and time settings
	historicalDataDaysBack: 30,
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
