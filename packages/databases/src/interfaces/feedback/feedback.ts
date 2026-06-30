/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const arrayStringType = 'Array(String)' as unknown as ClickHouseTableSchema<PublicFeedback>['reasons']['type'];

const tableSchema: ClickHouseTableSchema<PublicFeedback> = {
	agency_id: { type: 'LowCardinality(String)' },
	created_at: { type: 'UInt64' },
	entity_id: { type: 'String' },
	entity_type: { type: 'Enum8(\'line\' = 1, \'stop\' = 2)' },
	mood: { type: 'Enum8(\'happy\' = 1, \'unhappy\' = 2)' },
	reasons: { type: arrayStringType },
	schema_version: { type: 'LowCardinality(String)' },
};

/* * */

class FeedbackClass extends ClickHouseInterfaceTemplate<PublicFeedback> {
	//

	private static _instance: null | Promise<FeedbackClass> = null;

	protected override readonly databaseName = 'hub';
	protected override readonly engine: ClickHouseTableEngine<PublicFeedback> = 'MergeTree()';
	protected override readonly orderBy = 'created_at, agency_id, entity_type, entity_id';
	protected override readonly partitionBy = 'toYYYYMM(fromUnixTimestamp64Milli(toInt64(created_at)))';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'feedback';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new FeedbackClass();
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
		return GOClickHouseClient.getClient();
	}

	protected override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Feedback...');
	}

	//
}

/* * */

export const feedback = asyncSingletonProxy(FeedbackClass);
