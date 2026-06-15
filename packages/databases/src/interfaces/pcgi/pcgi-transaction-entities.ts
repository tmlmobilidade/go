/* * */

import { PCGIFileManagerClient } from '@/clients/pcgi-file-manager.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class PCGITransactionEntitiesClass extends MongoInterfaceTemplate<PcgiTransactionEntity, PcgiTransactionEntity, Partial<PcgiTransactionEntity>> {
	//

	private static _instance: null | Promise<PCGITransactionEntitiesClass> = null;

	protected override readonly collectionName = 'transactionEntity';
	protected override readonly databaseName = 'FileManagement';
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
				const instance = new PCGITransactionEntitiesClass();
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
		return PCGIFileManagerClient.getClient();
	}

	//
}

/* * */

export const pcgiTransactionEntities = asyncSingletonProxy(PCGITransactionEntitiesClass);
