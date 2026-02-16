/* * */

import z from 'zod';

/* * */

export const GtfsRtEffectValues = [
	'ACCESSIBILITY_ISSUE',
	'ADDITIONAL_SERVICE',
	'DETOUR',
	'MODIFIED_SERVICE',
	'NO_EFFECT',
	'NO_SERVICE',
	'OTHER_EFFECT',
	'REDUCED_SERVICE',
	'SIGNIFICANT_DELAYS',
	'STOP_MOVED',
	'UNKNOWN_EFFECT',
] as const;

export const GtfsRtEffectSchema = z.enum(GtfsRtEffectValues);

/**
 * The GTFS-RT standard effect types.
 * Use this type to represent the standard effects of a service alert
 * in GTFS-RT feeds, either when importing from standard GTFS-RT data into
 * the application or when exporting from the application to GTFS-RT format.
 */
export type GtfsRtEffect = z.infer<typeof GtfsRtEffectSchema>;
