/* * */

import { PCGIRawClient } from '@/clients/pcgi-raw.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { RawVehicleEvent } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class RawVehicleEventsNewClass extends MongoInterfaceTemplate<RawVehicleEvent> {
	//

	private static _instance: null | Promise<RawVehicleEventsNewClass> = null;

	public override readonly collectionName = 'raw_vehicle_events';
	public override readonly databaseName = 'raw_vehicle_events';
	public override readonly indexDescription = [
		{ key: { } },
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

	protected override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Vehicle Events...');
	}

	//
}

/* * */

/**
 * @deprecated This should not be used anymore. Only inside the `tracker` module
 * and then you should use the services provided by the local package.
 */
export const rawVehicleEventsNew = asyncSingletonProxy(RawVehicleEventsNewClass);
