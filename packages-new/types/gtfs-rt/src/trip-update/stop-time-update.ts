/* * */

import { z } from 'zod';

import { GtfsRtOccupancyStatusSchema } from '../shared/occupancy-status.js';
import { GtfsRtStopTimeEventSchema } from './stop-time-event.js';
import { GtfsRtStopTimePropertiesSchema } from './stop-time-properties.js';
import { GtfsRtStopTimeScheduleRelationshipSchema } from './stop-time-schedule-relationship.js';

/* * */

export const GtfsRtStopTimeUpdateSchema = z.object({
	arrival: GtfsRtStopTimeEventSchema,
	departure: GtfsRtStopTimeEventSchema,
	departure_occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
	schedule_relationship: GtfsRtStopTimeScheduleRelationshipSchema.nullish(),
	stop_id: z.string(),
	stop_sequence: z.number().nullish(),
	stop_time_properties: GtfsRtStopTimePropertiesSchema.nullish(),
});

export type GtfsRtStopTimeUpdate = z.infer<typeof GtfsRtStopTimeUpdateSchema>;
