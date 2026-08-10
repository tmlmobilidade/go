/* * */

import { z } from 'zod';

/* * */

export const GtfsRtScheduleRelationshipValues = [
	'SCHEDULED',
	'CANCELED',
	'REPLACEMENT',
	'DUPLICATED',
	'NEW',
	'DELETED',
	// 'ADDED', // deprecated
	// 'UNSCHEDULED', // used in frequencies.txt
] as const;

export const GtfsRtScheduleRelationshipSchema = z.enum(GtfsRtScheduleRelationshipValues);

export type GtfsRtScheduleRelationship = z.infer<typeof GtfsRtScheduleRelationshipSchema>;
