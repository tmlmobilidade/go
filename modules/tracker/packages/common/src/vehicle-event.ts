/* * */

import { z } from 'zod';

import { TrackerTtslV1Schema } from './ttsl.js';

/* * */

export const TrackerVehicleEventSchema = z.discriminatedUnion('version', [
	TrackerTtslV1Schema,
]);

/**
 * Vehicle Events are produced by the vehicle's on-board computer on a regular schedule
 * or whenever a significant event occurs. These events are used to track the vehicle's
 * location, speed, and status, as well as the current service being provided by the vehicle.
 * These events are based on the GTFS-RT specification but extended with additional fields
 * specific to TML's needs.
 */
export type TrackerVehicleEvent = z.infer<typeof TrackerVehicleEventSchema>;

/**
 * A HashableRawVehicleEvent is a RawVehicleEvent without the _id and received_at fields,
 * which are not relevant for hashing purposes. This type is used to create a unique hash
 * for each vehicle event based on its content, allowing us to identify duplicate events
 * and avoid storing them multiple times in the database.
 */
export type HashableTrackerVehicleEvent<T extends TrackerVehicleEvent> = Omit<T, '_id' | 'received_at'>;
