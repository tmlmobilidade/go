/**
 * Raw On-Board Refunds represent the raw on-board refunds as they are received from the data sources.
 * These are stored in MongoDB for persistence and later processing.
 * These documents are also different depending on the version of the enclosed APEX transaction.
**/

import { PCGIRawClient } from '@/clients/pcgi-raw.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { type RawApexTransaction, RawApexTransactionSchema } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class RawApexTransactionsClass extends MongoInterfaceTemplate<RawApexTransaction, RawApexTransaction, Partial<RawApexTransaction>> {
	//

	private static _instance: null | Promise<RawApexTransactionsClass> = null;

	protected override readonly collectionName = 'raw_apex_transactions';
	protected override readonly databaseName = 'raw';
	protected override readonly indexDescription: SimplifiedMongoIndex<RawApexTransaction>[] = [
		{ key: { created_at: 1 } },
		{ key: { agency_id: 1, created_at: 1 } },
		// eslint-disable-next-line perfectionist/sort-objects
		{ key: { version: 1, created_at: 1 } },
		// eslint-disable-next-line perfectionist/sort-objects
		{ key: { version: 1, received_at: 1 } },
	];

	protected override createSchema = RawApexTransactionSchema;
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
				const instance = new RawApexTransactionsClass();
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

export const rawApexTransactions = asyncSingletonProxy(RawApexTransactionsClass);
