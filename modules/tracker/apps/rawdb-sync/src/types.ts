/* * */

import { type MongoInterfaceTemplate, rawDb } from '@tmlmobilidade/go-interfaces-rawdb';

/**
 * Document type accepted by a given
 * `rawDb.vehicleEvents` collection.
 */
export type VehicleEventsCollectionDocument<C> = C extends MongoInterfaceTemplate<infer T, unknown> ? T : never;

/**
 * Valid `agency_id` <-> `rawDb.collection` pairs for vehicle-events sync.
 * Specifying either field narrows the other to the only matching value.
 */
export type SyncConfig = {
	[K in keyof typeof rawDb.vehicleEvents]: {
		agency_id: VehicleEventsCollectionDocument<typeof rawDb.vehicleEvents[K]>['agency_id']
		collection: typeof rawDb.vehicleEvents[K]
	}
}[keyof typeof rawDb.vehicleEvents];
