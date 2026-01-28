/* * */

import z from 'zod';

/* * */

export const GtfsCauseValues = [
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

export const GtfsCauseSchema = z.enum(GtfsCauseValues);

/**
 * The GTFS-RT standard cause types.
 * Use this type to represent the standard causes of a service alert
 * in GTFS-RT feeds, either when importing from standard GTFS-RT data into
 * the application or when exporting from the application to GTFS-RT format.
 */
export type GtfsCause = z.infer<typeof GtfsCauseSchema>;
