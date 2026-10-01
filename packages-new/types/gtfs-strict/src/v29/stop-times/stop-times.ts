/* * */

import { GtfsBinarySchema, GtfsPickupDropoffTypeSchema } from '@tmlmobilidade/go-types-gtfs';
import { NonNegativeFloatSchema, NonNegativeIntegerSchema, OperationalTimeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV29StopTimesSchema = z.object({
	arrival_time: OperationalTimeSchema,
	departure_time: OperationalTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema,
	pickup_type: GtfsPickupDropoffTypeSchema,
	shape_dist_traveled: NonNegativeFloatSchema,
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
	timepoint: GtfsBinarySchema,
	trip_id: z.string(),
});

/**
 * Represents a stop time in the custom GTFS strict v29 format.
 * A stop time is a record of when a transit vehicle arrives at and departs from a specific stop.
 * It includes information such as the arrival and departure times, the stop ID, the trip ID,
 * and various pickup and drop-off types. This information is crucial for scheduling and
 * coordinating transit services, allowing passengers to know when a vehicle will be at a particular stop
 * and what type of service is available at that stop.
 */
export type GtfsStrictV29StopTimes = z.infer<typeof GtfsStrictV29StopTimesSchema>;
