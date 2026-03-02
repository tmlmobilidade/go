/* * */

import { type AlertCause } from '@/alerts/cause.js';
import { type AlertEffect } from '@/alerts/effect.js';
import { type AlertReferenceType } from '@/alerts/reference-type.js';

/* * */

export const alertCauseEffectReferenceTypeMap = {

	ABUSIVE_PARKING: {
		ACCESSIBILITY_ISSUE: ['rides', 'lines', 'stops'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'lines', 'stops'],
		REDUCED_SERVICE: ['rides', 'lines', 'stops'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'stops'],
	},

	ACCIDENT: {
		DETOUR: ['rides', 'stops'],
		NO_SERVICE: ['rides', 'lines'],
		REDUCED_SERVICE: ['rides', 'lines'],
		SIGNIFICANT_DELAYS: ['rides', 'agency', 'lines'],
		STOP_MOVED: ['stops'],
	},

	CONSTRUCTION: {
		ACCESSIBILITY_ISSUE: ['rides', 'lines', 'stops'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'lines', 'stops'],
		REDUCED_SERVICE: ['rides', 'lines', 'stops'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'stops'],
		STOP_MOVED: ['stops'],
	},

	DEMONSTRATION: {
		ACCESSIBILITY_ISSUE: ['rides'],
		ADDITIONAL_SERVICE: ['rides', 'lines', 'agency'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'lines', 'stops'],
		REDUCED_SERVICE: ['rides', 'lines', 'stops'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'stops', 'agency'],
		STOP_MOVED: ['stops'],
	},

	DRIVER_ABSENCE: {
		NO_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	DRIVER_ISSUE: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	HIGH_PASSENGER_LOAD: {
		ACCESSIBILITY_ISSUE: ['rides'],
		ADDITIONAL_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	MEDICAL_EMERGENCY: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	NETWORK_UPDATE: {
		ADDITIONAL_SERVICE: ['lines', 'stops'],
		DETOUR: ['lines', 'stops'],
		MODIFIED_SERVICE: ['lines', 'stops'],
		NO_SERVICE: ['lines', 'stops'],
		STOP_MOVED: ['stops'],
	},

	POLICE_ACTIVITY: {
		DETOUR: ['rides', 'lines'],
		NO_SERVICE: ['rides', 'lines'],
		REDUCED_SERVICE: ['rides', 'lines'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'agency'],
	},

	PUBLIC_DISORDER: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	ROAD_ISSUE: {
		ACCESSIBILITY_ISSUE: ['rides', 'lines', 'stops'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'lines', 'stops'],
		REDUCED_SERVICE: ['rides', 'lines', 'stops'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'stops'],
		STOP_MOVED: ['stops'],
	},

	STRIKE: {
		ADDITIONAL_SERVICE: ['lines', 'stops', 'agency'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'agency', 'lines'],
		REDUCED_SERVICE: ['rides', 'lines'],
		SIGNIFICANT_DELAYS: ['rides', 'agency'],
	},

	TECHNICAL_ISSUE: {
		ACCESSIBILITY_ISSUE: ['rides'],
		NO_SERVICE: ['rides'],
		ON_BOARD_SALE_ISSUE: ['rides'],
		REALTIME_INFO_ISSUE: ['rides', 'agency'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides', 'agency'],
	},

	TRAFFIC_JAM: {
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides', 'agency', 'lines', 'stops'],
	},

	VEHICLE_ISSUE: {
		ACCESSIBILITY_ISSUE: ['rides'],
		NO_SERVICE: ['rides'],
		ON_BOARD_SALE_ISSUE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	WEATHER: {
		ACCESSIBILITY_ISSUE: ['rides', 'lines', 'stops'],
		DETOUR: ['rides', 'lines', 'stops'],
		NO_SERVICE: ['rides', 'lines', 'stops'],
		REDUCED_SERVICE: ['rides', 'lines', 'stops'],
		SIGNIFICANT_DELAYS: ['rides', 'lines', 'stops', 'agency'],
		STOP_MOVED: ['stops'],
	},

} as const satisfies Record<AlertCause, Partial<Record<AlertEffect, AlertReferenceType[]>>>;

/* * */
type ReferenceTypes<C extends keyof typeof alertCauseEffectReferenceTypeMap, E extends keyof typeof alertCauseEffectReferenceTypeMap[C]> = (typeof alertCauseEffectReferenceTypeMap)[C][E] extends readonly (infer R)[] ? R & string : never;

type CauseEffectUnion<C extends keyof typeof alertCauseEffectReferenceTypeMap> = {
	[E in keyof typeof alertCauseEffectReferenceTypeMap[C]]: `${C & string}:${E & string}:${ReferenceTypes<C, E>}`
}[keyof typeof alertCauseEffectReferenceTypeMap[C]];

/**
 * Type representing all valid combinations of alert causes with
 * their corresponding effects and allowed reference types. Each combination
 * is represented as a string in the format "CAUSE:EFFECT:REFERENCE_TYPE".
 * This is useful for defining specific alert configurations based on cause-effect pairs.
 */
export type AlertCauseEffectReference = {
	[C in keyof typeof alertCauseEffectReferenceTypeMap]: CauseEffectUnion<C>
}[keyof typeof alertCauseEffectReferenceTypeMap];
