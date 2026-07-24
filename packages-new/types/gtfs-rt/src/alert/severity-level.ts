/* * */

import z from 'zod';

/* * */

export const GtfsRtSeverityLevelValues = [
	'UNKNOWN_SEVERITY',
	'INFO',
	'WARNING',
	'SEVERE',
] as const;

export const GtfsRtSeverityLevelSchema = z.enum(GtfsRtSeverityLevelValues);

export type GtfsRtSeverityLevel = z.infer<typeof GtfsRtSeverityLevelSchema>;
