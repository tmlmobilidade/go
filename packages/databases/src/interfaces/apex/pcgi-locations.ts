/* eslint-disable @typescript-eslint/no-explicit-any */

import { PCGIValidationsClient } from '@/clients/pcgi-validations.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class PCGILocationsClass extends MongoInterfaceTemplate<any, any, Partial<any>> {
	//

	private static _instance: null | Promise<PCGILocationsClass> = null;

	protected override readonly collectionName = 'locationEntity';
	protected override readonly databaseName = 'LocationManagement';
	protected override readonly indexDescription = false;

	protected override createSchema = null;
	protected override updateSchema = null;

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new PCGILocationsClass();
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
		return PCGIValidationsClient.getClient();
	}

	//
}

/* * */

export const pcgiLocations = asyncSingletonProxy(PCGILocationsClass);
