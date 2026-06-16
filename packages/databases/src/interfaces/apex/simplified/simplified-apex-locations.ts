/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexLocation> = {
	_id: { type: 'UUID' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_version: { type: 'LowCardinality(String)' },
	calendar_date: { type: 'Date' },
	created_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	device_id: { type: 'LowCardinality(String)' },
	line_id: { type: 'Nullable(LowCardinality(String))' },
	mac_ase_counter_value: { type: 'UInt64' },
	mac_sam_serial_number: { type: 'UInt64' },
	pattern_id: { type: 'Nullable(LowCardinality(String))' },
	received_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	stop_id: { type: 'Nullable(LowCardinality(String))' },
	trip_id: { type: 'Nullable(String)' },
	updated_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	vehicle_id: { type: 'Nullable(LowCardinality(String))' },
};

/* * */

class SimplifiedApexLocationsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexLocation> {
	//

	private static _instance: null | Promise<SimplifiedApexLocationsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'locations';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexLocationsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex Locations...');
	}

	//
}

/* * */

export const simplifiedApexLocationsNew = asyncSingletonProxy(SimplifiedApexLocationsNewClass);
