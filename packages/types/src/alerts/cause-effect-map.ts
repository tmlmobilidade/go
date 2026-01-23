/* * */

import { type GtfsCauseExtended } from '@/gtfs/cause.js';
import { type GtfsEffectExtended } from '@/gtfs/effect.js';

/* * */

export const AlertCauseEffectMap = {

	ACCIDENT: [
		'SIGNIFICANT_DELAYS',
		'REDUCED_SERVICE',
		'NO_SERVICE',
		'DETOUR',
	],

	CONSTRUCTION: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
		'ACCESSIBILITY_ISSUE',
		'STOP_MOVED',
	],

	DEMONSTRATION: [
		'MODIFIED_SERVICE',
		'SIGNIFICANT_DELAYS',
		'ADDITIONAL_SERVICE',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'ACCESSIBILITY_ISSUE',
		'DETOUR',
	],

	DRIVER_ABSENCE: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
	],

	DRIVER_ISSUE: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
	],

	HIGH_PASSENGER_LOAD: [
		'ADDITIONAL_SERVICE',
		'ACCESSIBILITY_ISSUE',
		'SIGNIFICANT_DELAYS',
	],

	MEDICAL_EMERGENCY: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
	],

	POLICE_ACTIVITY: [
		'SIGNIFICANT_DELAYS',
		'REDUCED_SERVICE',
		'NO_SERVICE',
		'DETOUR',
	],

	PUBLIC_DISORDER: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
	],

	ROAD_ISSUE: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
		'ACCESSIBILITY_ISSUE',
	],

	STRIKE: [
		'SIGNIFICANT_DELAYS',
		'ADDITIONAL_SERVICE',
		'DETOUR',
		'NO_SERVICE',
		'REDUCED_SERVICE',
	],

	TECHNICAL_ISSUE: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'ACCESSIBILITY_ISSUE',
		'REALTIME_INFO_ISSUE',
		'ON_BOARD_SALE_ISSUE',
	],

	TRAFFIC_JAM: [
		'SIGNIFICANT_DELAYS',
		'REDUCED_SERVICE',
		'NO_SERVICE',
		'DETOUR',
	],

	WEATHER: [
		'SIGNIFICANT_DELAYS',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'DETOUR',
		'ACCESSIBILITY_ISSUE',
	],

} as const satisfies Record<GtfsCauseExtended, readonly GtfsEffectExtended[]>;

/**
 * Type representing all valid combinations of alert causes
 * and their corresponding effects. Each combination is represented
 * as a string in the format "CAUSE:EFFECT". This is useful for defining
 * specific alert configurations based on cause-effect pairs.
 */
export type AlertCauseEffectPairs = {
	[C in keyof typeof AlertCauseEffectMap]: `${C}:${(typeof AlertCauseEffectMap)[C][number]}`
}[keyof typeof AlertCauseEffectMap];
