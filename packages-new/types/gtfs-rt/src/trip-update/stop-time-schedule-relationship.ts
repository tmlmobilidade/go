/* * */

import { z } from 'zod';

/* * */

export const GtfsRtStopTimeScheduleRelationshipValues = [
	'SCHEDULED',
	'SKIPPED',
	'NO_DATA',
	'UNSCHEDULED',
] as const;

export const GtfsRtStopTimeScheduleRelationshipSchema = z.enum(GtfsRtStopTimeScheduleRelationshipValues);

export type GtfsRtStopTimeScheduleRelationship = z.infer<typeof GtfsRtStopTimeScheduleRelationshipSchema>;
