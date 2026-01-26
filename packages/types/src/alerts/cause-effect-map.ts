/* * */

import { type AlertCause } from '@/alerts/cause.js';
import { type AlertEffect } from '@/alerts/effect.js';

import { AlertReferenceType } from './reference-type.js';

/* * */

export const alertCauseEffectReferenceTypeMap = {

	ACCIDENT: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	CONSTRUCTION: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
		STOP_MOVED: ['agency', 'lines', 'rides', 'stops'],
	},

	DEMONSTRATION: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		ADDITIONAL_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	DRIVER_ABSENCE: {
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	DRIVER_ISSUE: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	HIGH_PASSENGER_LOAD: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		ADDITIONAL_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	MEDICAL_EMERGENCY: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	POLICE_ACTIVITY: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	PUBLIC_DISORDER: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	ROAD_ISSUE: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	STRIKE: {
		ADDITIONAL_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	TECHNICAL_ISSUE: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		ON_BOARD_SALE_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		REALTIME_INFO_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	TRAFFIC_JAM: {
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
	},

	WEATHER: {
		ACCESSIBILITY_ISSUE: ['agency', 'lines', 'rides', 'stops'],
		DETOUR: ['agency', 'lines', 'rides', 'stops'],
		NO_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		REDUCED_SERVICE: ['agency', 'lines', 'rides', 'stops'],
		SIGNIFICANT_DELAYS: ['agency', 'lines', 'rides', 'stops'],
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
