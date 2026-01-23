/* * */

import z from 'zod';

/* * */

export const GtfsEffectValues = [
	'ACCESSIBILITY_ISSUE',
	'ADDITIONAL_SERVICE',
	'DETOUR',
	'MODIFIED_SERVICE',
	'NO_SERVICE',
	'REDUCED_SERVICE',
	'SIGNIFICANT_DELAYS',
	'STOP_MOVED',
	// 'NO_EFFECT',
	// 'OTHER_EFFECT',
	// 'UNKNOWN_EFFECT',
] as const;

export const GtfsEffectSchema = z.enum(GtfsEffectValues);

export type GtfsEffect = z.infer<typeof GtfsEffectSchema>;

/* * */

export const GtfsEffectExtendedValues = [
	...GtfsEffectValues,
	'REALTIME_INFO_ISSUE',
	'ON_BOARD_SALE_ISSUE',
] as const;

export const GtfsEffectExtendedSchema = z.enum(GtfsEffectExtendedValues);

export type GtfsEffectExtended = z.infer<typeof GtfsEffectExtendedSchema>;

/* * */

export const GtfsExtendedEffectMap: Record<GtfsEffectExtended, GtfsEffect> = Object.freeze({

	/* --- Standard GtfsExtended Effects --- */
	ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
	ADDITIONAL_SERVICE: 'ADDITIONAL_SERVICE',
	DETOUR: 'DETOUR',
	MODIFIED_SERVICE: 'MODIFIED_SERVICE',
	NO_SERVICE: 'NO_SERVICE',
	REDUCED_SERVICE: 'REDUCED_SERVICE',
	SIGNIFICANT_DELAYS: 'SIGNIFICANT_DELAYS',
	STOP_MOVED: 'STOP_MOVED',
	// NO_EFFECT: 'NO_EFFECT',
	// OTHER_EFFECT: 'OTHER_EFFECT',
	// UNKNOWN_EFFECT: 'UNKNOWN_EFFECT',

	/* --- Extended Operational Effects --- */
	ON_BOARD_SALE_ISSUE: 'MODIFIED_SERVICE',
	REALTIME_INFO_ISSUE: 'MODIFIED_SERVICE',

});
