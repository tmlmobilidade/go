/* * */

import { z } from 'zod';

/**
 * Represents a stop time in the GTFS (General Transit Feed Specification) format.
 * A stop time is a record of when a transit vehicle arrives at and departs from a specific stop.
 * It includes information such as the arrival and departure times, the stop ID, the trip ID,
 * and various pickup and drop-off types. This information is crucial for scheduling and
 * coordinating transit services, allowing passengers to know when a vehicle will be at a particular stop
 * and what type of service is available at that stop.
 */
export const GtfsStopTimesSchema = z.object({
	arrival_time: z.string(),
	continuous_drop_off: z.string().optional(),
	continuous_pickup: z.string().optional(),
	departure_time: z.string(),
	drop_off_type: z.string().optional(),
	pickup_type: z.string().optional(),
	shape_dist_traveled: z.number(),
	stop_headsign: z.string().optional(),
	stop_id: z.string(),
	stop_sequence: z.number(),
	timepoint: z.string(),
	trip_id: z.string(),
});

export type GtfsStopTimes = z.infer<typeof GtfsStopTimesSchema>;
