/* eslint-disable @typescript-eslint/no-explicit-any */

import { PCGIRawClient } from '@/clients/pcgi-raw.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class PCGISalesClass extends MongoInterfaceTemplate<any, any, Partial<any>> {
	//

	private static _instance: null | Promise<PCGISalesClass> = null;

	protected override readonly collectionName = 'salesEntity';
	protected override readonly databaseName = 'SalesManagement';
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
				const instance = new PCGISalesClass();
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

export const pcgiSales = asyncSingletonProxy(PCGISalesClass);
