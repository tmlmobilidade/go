/* * */

import { type TimeSlot, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

/* * */

export interface AppConfig {
	/** Agencies whose rides are loaded. */
	agencyIds: string[]
	processing: {
		/** Current rides window (exclusive end), in unix ms. */
		currentRidesEndTime: UnixMilliseconds
		/** Current rides window (inclusive start), in unix ms. */
		currentRidesStartTime: UnixMilliseconds
		/** Geohash prefix length used to restrict candidate events to cells near a stop. A length of 6 matches a geohash-7 cell and its neighbours (~1.2 km). */
		geohashPrefixLength: number
		/** Historical rides window (exclusive end), in unix ms. */
		historicalRidesEndTime: UnixMilliseconds
		/** Historical rides window (inclusive start), in unix ms. */
		historicalRidesStartTime: UnixMilliseconds
		/** Length of shape node chunks in meters. */
		shapeNodeChunkLength: number
	}
	stages: {
		_1_bootstrap: boolean
		_2_loadCurrentRides: boolean
		_3_loadHistoricalRides: boolean
		_4_loadHistoricalShapeNodes: boolean
		_5_loadHistoricalVehicleEvents: boolean
		_6_calculateNodeTravelTimes: boolean
		_7_loadCurrentWaypoints: boolean
		_8_cleanup: boolean
	}
	syncInterval: TimeSlot
}
