/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<DemandByAgencyByOperationalDate> = {
	agency_id: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	qty: { type: 'UInt64' },
	updated_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
};

/* * */

class DemandByAgencyByOperationalDateClass extends ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate> {
	//

	private static _instance: null | Promise<DemandByAgencyByOperationalDateClass> = null;

	protected override readonly databaseName = 'performance';
	protected override readonly engine: ClickHouseTableEngine<DemandByAgencyByOperationalDate> = 'ReplacingMergeTree(updated_at)';
	protected override readonly orderBy = 'operational_date, agency_id';
	protected override readonly partitionBy = 'intDiv(operational_date, 100)';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'demand_by_agency_by_operational_date';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new DemandByAgencyByOperationalDateClass();
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
		console.log('Post init ClickHouse service for Demand by Agency by Operational Date...');
	}

	//
}

/* * */

export const demandByAgencyByOperationalDate = asyncSingletonProxy(DemandByAgencyByOperationalDateClass);
