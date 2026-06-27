/* * */

import { GtfsRtOccupancyStatusSchema } from '@/shared/occupancy-status.js';
import { GtfsRtScheduleRelationshipSchema } from '@/shared/schedule-relationship.js';
import { GtfsRtStopTimeEventSchema } from '@/trip-update/stop-time-event.js';
import { GtfsRtStopTimePropertiesSchema } from '@/trip-update/stop-time-properties.js';
import { z } from 'zod';

/* * */

export const GtfsRtStopTimeUpdateSchema = z.object({
	arrival: GtfsRtStopTimeEventSchema,
	departure: GtfsRtStopTimeEventSchema,
	departure_occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
	schedule_relationship: GtfsRtScheduleRelationshipSchema.nullish(),
	stop_id: z.string(),
	stop_sequence: z.number().nullish(),
	stop_time_properties: GtfsRtStopTimePropertiesSchema.nullish(),
});

export type GtfsRtStopTimeUpdate = z.infer<typeof GtfsRtStopTimeUpdateSchema>;
