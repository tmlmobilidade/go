/* * */

import { NonNegativeFloatSchema, NonNegativeIntegerSchema, OperationalTimeSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsBinarySchema } from '../shared/binary.js';
import { GtfsPickupDropoffTypeSchema } from '../shared/pickup-dropoff-type.js';

/* * */

export const GtfsStopTimesSchema = z.object({
	arrival_time: OperationalTimeSchema,
	continuous_drop_off: GtfsPickupDropoffTypeSchema.default('1'),
	continuous_pickup: GtfsPickupDropoffTypeSchema.default('1'),
	departure_time: OperationalTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema.default('1'),
	pickup_type: GtfsPickupDropoffTypeSchema.default('1'),
	shape_dist_traveled: NonNegativeFloatSchema.default(0),
	stop_headsign: z.string().default(''),
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
	timepoint: GtfsBinarySchema.default('0'),
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
