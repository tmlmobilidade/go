import type { TimeSlot } from '@tmlmobilidade/dates';

export const AppConfig = Object.freeze({
	interval: '15m' as TimeSlot,
	pipelineSteps: {
		cleanupCurrentRides: true,
		cleanupCurrentVehicleEvents: true,
		cleanupCurrentWaypoints: true,
	},
	windowHoursBefore: 1,
});
