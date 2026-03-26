/* * */

import { RawVehicleEventCapV1Schema } from '@/vehicle-events/raw/cap/v1.js';
import { RawVehicleEventCcflV1Schema } from '@/vehicle-events/raw/ccfl/v1.js';
import { RawVehicleEventCmetV1Schema } from '@/vehicle-events/raw/cmet/v1.js';
import { RawVehicleEventTtslV1Schema } from '@/vehicle-events/raw/ttsl/v1.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventSchema = z.discriminatedUnion('version', [
	RawVehicleEventCapV1Schema,
	RawVehicleEventCcflV1Schema,
	RawVehicleEventCmetV1Schema,
	RawVehicleEventTtslV1Schema,
]);

/**
 * This type represents the raw vehicle event as it is received from
 * the data sources (e.g., GTFS-RT feeds, extended variants, etc.).
 * It includes all the fields present in the original event,
 * without any transformation or simplification, but with a common header like structure
 * to keep track of version, entity_id, and other metadata.
 * This type is used for storing the raw events in the database
 * before converting them into the simplified format.
 */
export type RawVehicleEvent = z.infer<typeof RawVehicleEventSchema>;

/**
 * A HashableRawVehicleEvent is a RawVehicleEvent without the _id and received_at fields,
 * which are not relevant for hashing purposes. This type is used to create a unique hash
 * for each vehicle event based on its content, allowing us to identify duplicate events
 * and avoid storing them multiple times in the database.
 */
export type HashableRawVehicleEvent<T extends RawVehicleEvent> = Omit<T, '_id' | 'received_at'>;
