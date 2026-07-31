/* * */

import { GtfsBinarySchema, GtfsPickupDropoffTypeSchema, GtfsStopTimesSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV29StopTimesSchema = GtfsStopTimesSchema.extend({
	arrival_time: GtfsTimeSchema,
	continuous_drop_off: GtfsPickupDropoffTypeSchema.default('1'),
	continuous_pickup: GtfsPickupDropoffTypeSchema.default('1'),
	departure_time: GtfsTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema.default('1'),
	pickup_type: GtfsPickupDropoffTypeSchema.default('1'),
	shape_dist_traveled: NonNegativeNumberSchema,
	stop_id: z.string(),
	stop_sequence: NonNegativeNumberSchema,
	timepoint: GtfsBinarySchema,
	trip_id: z.string(),
}).omit({
	stop_headsign: true,
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
