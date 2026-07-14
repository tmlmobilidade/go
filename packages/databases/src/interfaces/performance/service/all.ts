/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type ServiceAll } from '@tmlmobilidade/go-types-performance';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<ServiceAll> = {
	agency_id: { type: 'LowCardinality(String)' },
	line_id: { type: 'UInt32' },
	operational_date: { type: 'UInt32' },
	pass_trip_count: { type: 'UInt64' },
	pass_trip_percentage: { type: 'Float64' },
	total_trip_count: { type: 'UInt64' },
	updated_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
};

/* * */

class ServiceAllClass extends ClickHouseInterfaceTemplate<ServiceAll> {
	//

	private static _instance: null | Promise<ServiceAllClass> = null;

	protected override readonly databaseName = 'performance';
	protected override readonly engine: ClickHouseTableEngine<ServiceAll> = 'ReplacingMergeTree(updated_at)';
	protected override readonly orderBy = 'operational_date, line_id';
	protected override readonly partitionBy = 'intDiv(operational_date, 100)';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'service_all';
	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ServiceAllClass();
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
		console.log('Post init ClickHouse service for all service metrics...');
	}

	//
}

/* * */

export const serviceAll = asyncSingletonProxy(ServiceAllClass);
