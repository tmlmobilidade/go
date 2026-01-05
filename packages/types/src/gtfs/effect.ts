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
