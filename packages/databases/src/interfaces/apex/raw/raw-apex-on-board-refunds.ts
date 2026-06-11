/**
 * Raw On-Board Refunds represent the raw on-board refunds as they are received from the data sources.
 * These are stored in MongoDB for persistence and later processing.
 * These documents are also different depending on the version of the enclosed APEX transaction.
**/

import { PCGIRawClient } from '@/clients/pcgi-raw.js';
import { MongoInterfaceTemplate } from '@/templates/mongodb.js';
import { type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { type RawApexOnBoardRefund, RawApexOnBoardRefundSchema } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

class RawApexOnBoardRefundsClass extends MongoInterfaceTemplate<RawApexOnBoardRefund, RawApexOnBoardRefund, Partial<RawApexOnBoardRefund>> {
	//

	private static _instance: null | Promise<RawApexOnBoardRefundsClass> = null;

	protected override readonly collectionName = 'raw_apex_on_board_refunds';
	protected override readonly databaseName = 'raw';
	protected override readonly indexDescription: SimplifiedMongoIndex<RawApexOnBoardRefund>[] = [
		{ key: { created_at: 1 } },
		{ key: { agency_id: 1, created_at: 1 } },
		// eslint-disable-next-line perfectionist/sort-objects
		{ key: { version: 1, created_at: 1 } },
		// eslint-disable-next-line perfectionist/sort-objects
		{ key: { version: 1, received_at: 1 } },
	];

	protected override createSchema = RawApexOnBoardRefundSchema;
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
				const instance = new RawApexOnBoardRefundsClass();
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

export const rawApexOnBoardRefunds = asyncSingletonProxy(RawApexOnBoardRefundsClass);
