/* * */

import type { Dates, TimeSlot } from '@tmlmobilidade/dates';

/* * */

export interface AppConfig {
	agencyIds: string[]
	database: string
	development: {
		isDevelopment: boolean
		lineIds: number[]
		timeEnd: Dates
		timeStart: Dates
	}
	historicalDataDaysBack: number
	historicalTransformationChunkDays: number
	historicalVehicleEventsChunkDays: number
	pipelineSteps: {
		detectRideStartEndEvents: boolean
		insertCurrentWindowRides: boolean
		insertCurrentWindowWaypoints: boolean
		insertHistoricalRidesByDay: boolean
		insertHistoricalShapeNodes: boolean
		insertHistoricalVehicleEvents: boolean
		runDdl: boolean
		runTransformationAndAggregationQueries: boolean
		truncatePipelineTables: boolean
	}
	/** Geofence radius (meters) around first/last stop used to detect observed start/end times. */
	rideEventBufferRadiusMeters: number
	/** Number of hist_rides processed per detection batch (one detect query + one mutation each). */
	rideEventDetectionBatchSize: number
	/** Geohash prefix length used to restrict candidate events to cells near a stop. A length of 6 matches a geohash-7 cell and its neighbours (~1.2 km). */
	rideEventGeohashPrefixLength: number
	/** Milliseconds after a ride's scheduled start to stop scanning for vehicle events. */
	rideEventWindowPostMs: number
	/** Milliseconds before a ride's scheduled start to begin scanning for vehicle events. */
	rideEventWindowPreMs: number
	shapeNodeChunkLength: number
	syncInterval: TimeSlot
}
