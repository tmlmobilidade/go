/* * */

import { GtfsBinarySchema } from '@/shared/binary.js';
import { GtfsTimeSchema } from '@/shared/gtfs-time.js';
import { GtfsPickupDropoffTypeSchema } from '@/shared/pickup-dropoff-type.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStopTimesSchema = z.object({
	arrival_time: GtfsTimeSchema,
	continuous_drop_off: GtfsPickupDropoffTypeSchema.optional(),
	continuous_pickup: GtfsPickupDropoffTypeSchema.optional(),
	departure_time: GtfsTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema.optional(),
	pickup_type: GtfsPickupDropoffTypeSchema.optional(),
	shape_dist_traveled: NonNegativeNumberSchema.optional(),
	stop_headsign: z.string().optional(),
	stop_id: z.string(),
	stop_sequence: NonNegativeNumberSchema,
	timepoint: GtfsBinarySchema,
	trip_id: z.string(),
});

/**
 * Represents a stop time in the GTFS format.
 * A stop time is a record of when a transit vehicle arrives at and departs from a specific stop.
 * It includes information such as the arrival and departure times, the stop ID, the trip ID,
 * and various pickup and drop-off types. This information is crucial for scheduling and
 * coordinating transit services, allowing passengers to know when a vehicle will be at a particular stop
 * and what type of service is available at that stop.
 */
export type GtfsStopTimes = z.infer<typeof GtfsStopTimesSchema>;
