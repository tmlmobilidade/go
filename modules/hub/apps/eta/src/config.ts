/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';

import { type AppConfig } from './types/config.js';

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
export function getAppConfig(): AppConfig {
	const now = Dates.now('local');
	return {
		agencyIds: ['IA9T6', 'A3H3M', 'HF16N', 'LA77N', 'BNA17', 'YA15B', 'A2L1N'],
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
