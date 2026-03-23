/* * */

import { PCGIRawClient } from '@/clients/pcgi-raw.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class RawVehicleEventsNewClass extends MongoInterfaceTemplate<RawVehicleEvent> {
	//

	private static _instance: null | Promise<RawVehicleEventsNewClass> = null;

	public override readonly collectionName = 'raw_vehicle_events';
	public override readonly databaseName = 'raw_vehicle_events';
	public override readonly indexDescription: SimplifiedMongoIndex<RawVehicleEvent>[] = [
		{ key: { agency_id: 1, created_at: 1 } },
	];

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new RawVehicleEventsNewClass();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.init();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		return await this._instance;
	}

	protected override connectToClient() {
		return PCGIRawClient.getClient();
	}

	//
}

/* * */

export const rawVehicleEventsNew = asyncSingletonProxy(RawVehicleEventsNewClass);
