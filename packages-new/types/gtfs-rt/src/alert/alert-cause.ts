/* * */

import z from 'zod';

/* * */

export const GtfsRtCauseValues = [
	'ACCIDENT',
	'CONSTRUCTION',
	'DEMONSTRATION',
	'HOLIDAY',
	'MAINTENANCE',
	'MEDICAL_EMERGENCY',
	'OTHER_CAUSE',
	'POLICE_ACTIVITY',
	'STRIKE',
	'TECHNICAL_ISSUE',
	'UNKNOWN_CAUSE',
	'WEATHER',
] as const;

export const GtfsRtCauseSchema = z.enum(GtfsRtCauseValues);

/**
 * The GTFS-RT standard cause types.
 * Use this type to represent the standard causes of a service alert
 * in GTFS-RT feeds, either when importing from standard GTFS-RT data into
 * the application or when exporting from the application to GTFS-RT format.
 */
export type GtfsRtCause = z.infer<typeof GtfsRtCauseSchema>;
