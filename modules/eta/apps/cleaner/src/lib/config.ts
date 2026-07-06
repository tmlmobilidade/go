import type { TimeSlot } from '@tmlmobilidade/dates';

function getEtaDatabase(): string {
	return process.env.ENVIRONMENT === 'dev' ? 'eta_dev' : 'eta';
}

export const AppConfig = Object.freeze({
	database: getEtaDatabase(),
	historicalDataDaysBack: 30,
	interval: '15m' as TimeSlot,
	pipelineSteps: {
		cleanupCurrentRides: true,
		cleanupCurrentVehicleEvents: true,
		cleanupCurrentWaypoints: true,
		cleanupHistoricalNodeTravelTimes: true,
		cleanupHistoricalNodeTravelTimesAggregation: true,
		cleanupHistoricalRides: true,
		cleanupHistoricalShapes: true,
		cleanupHistoricalVehicleEvents: true,
	},
	windowHoursBefore: 1,
});
