/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';

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

/* * */

const IS_PRODUCTION = process.env.ENVIRONMENT === 'prd';

export const SYNC_INTERVAL: AppConfig['syncInterval'] = '15m';

/* * */

/**
 * Builds the configuration for one loader run.
 *
 * The time windows are relative to "now", so this must be called at the start
 * of every run rather than once at startup: a config built at process start
 * would keep the same windows for as long as the worker lives.
 *
 * @returns The configuration for the current run.
 */
export async function getAppConfig(): Promise<AppConfig> {
	const now = Dates.now('local');
	const agencyIds = await goDb.core.agencies.findMany({ 'open_data.services.eta_enabled': true }, { projection: { _id: 1 } });
	return {
		agencyIds: agencyIds.map(agency => agency._id),
		processing: {
			currentRidesEndTime: now.plus({ hours: Dates.standardWindowHours }).unix_milliseconds,
			currentRidesStartTime: now.minus({ hours: Dates.standardWindowHours }).unix_milliseconds,
			geohashPrefixLength: 6,
			historicalRidesEndTime: now.minus({ hours: Dates.standardWindowHours }).unix_milliseconds,
			historicalRidesStartTime: now.minus({ days: 30, hours: Dates.standardWindowHours }).unix_milliseconds,
			shapeNodeChunkLength: 25,
		},
		stages: {
			_1_bootstrap: !IS_PRODUCTION,
			_2_loadCurrentRides: true,
			_3_loadHistoricalRides: true,
			_4_loadHistoricalShapeNodes: true,
			_5_loadHistoricalVehicleEvents: true,
			_6_calculateNodeTravelTimes: true,
			_7_loadCurrentWaypoints: true,
			_8_cleanup: true,
		},
		syncInterval: SYNC_INTERVAL,
	};
}
