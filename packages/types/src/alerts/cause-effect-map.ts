/* * */

import { type AlertCause } from '@/alerts/cause.js';
import { type AlertEffect } from '@/alerts/effect.js';
import { type AlertReferenceType } from '@/alerts/reference-type.js';

/* * */

export const alertCauseEffectReferenceTypeMap = {

	ACCIDENT: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	CONSTRUCTION: {
		ACCESSIBILITY_ISSUE: ['rides'],
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
		STOP_MOVED: ['stops'],
	},

	DEMONSTRATION: {
		ACCESSIBILITY_ISSUE: ['rides'],
		ADDITIONAL_SERVICE: ['rides'],
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
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

	POLICE_ACTIVITY: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	PUBLIC_DISORDER: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	ROAD_ISSUE: {
		ACCESSIBILITY_ISSUE: ['rides'],
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	STRIKE: {
		ADDITIONAL_SERVICE: ['rides'],
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	TECHNICAL_ISSUE: {
		ACCESSIBILITY_ISSUE: ['rides'],
		NO_SERVICE: ['rides'],
		ON_BOARD_SALE_ISSUE: ['rides'],
		REALTIME_INFO_ISSUE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	TRAFFIC_JAM: {
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
	},

	WEATHER: {
		ACCESSIBILITY_ISSUE: ['rides'],
		DETOUR: ['rides'],
		NO_SERVICE: ['rides'],
		REDUCED_SERVICE: ['rides'],
		SIGNIFICANT_DELAYS: ['rides'],
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
