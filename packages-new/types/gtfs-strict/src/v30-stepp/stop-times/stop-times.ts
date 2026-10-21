/* * */

import { GtfsBinarySchema, GtfsPickupDropoffTypeSchema } from '@tmlmobilidade/go-types-gtfs';
import { NonNegativeFloatSchema, NonNegativeIntegerSchema, OperationalTimeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppStopTimesSchema = z.object({
	arrival_time: OperationalTimeSchema,
	continuous_drop_off: z.number().optional(),
	continuous_pickup: z.number().optional(),
	departure_time: OperationalTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema.optional(),
	pickup_type: GtfsPickupDropoffTypeSchema.optional(),
	shape_dist_traveled: NonNegativeFloatSchema.optional(),
	stop_headsign: z.string().optional(),
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
	timepoint: GtfsBinarySchema.optional(),
	trip_id: z.string(),
});

/**
 * Represents a stop time in the custom GTFS strict v30 STEPP format.
 * A stop time is a record of when a transit vehicle arrives at and departs from a specific stop.
 * It includes information such as the arrival and departure times, the stop ID, the trip ID,
 * and various pickup and drop-off types. This information is crucial for scheduling and
 * coordinating transit services, allowing passengers to know when a vehicle will be at a particular stop
 * and what type of service is available at that stop.
 */
export type GtfsStrictV30SteppStopTimes = z.infer<typeof GtfsStrictV30SteppStopTimesSchema>;
