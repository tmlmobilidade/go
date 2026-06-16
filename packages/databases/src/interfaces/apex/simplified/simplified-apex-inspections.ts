/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexInspection> = {
	_id: { type: 'UUID' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_version: { type: 'LowCardinality(String)' },
	calendar_date: { type: 'Date' },
	card_serial_number: { type: 'Nullable(UInt64)' },
	control_destination_stop_id: { type: 'Nullable(LowCardinality(String))' },
	control_origin_stop_id: { type: 'Nullable(LowCardinality(String))' },
	control_status: { type: 'UInt8' },
	created_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	device_id: { type: 'LowCardinality(String)' },
	environment_status: { type: 'UInt8' },
	inspection_id: { type: 'Nullable(String)' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	line_id: { type: 'Nullable(LowCardinality(String))' },
	mac_ase_counter_value: { type: 'UInt64' },
	mac_sam_serial_number: { type: 'UInt64' },
	pattern_id: { type: 'Nullable(LowCardinality(String))' },
	product_id: { type: 'Nullable(LowCardinality(String))' },
	received_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	trip_id: { type: 'Nullable(String)' },
	updated_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	vehicle_id: { type: 'Nullable(LowCardinality(String))' },
};

/* * */

class SimplifiedApexInspectionsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexInspection> {
	//

	private static _instance: null | Promise<SimplifiedApexInspectionsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'inspections';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexInspectionsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex Inspections...');
	}

	//
}

/* * */

export const simplifiedApexInspectionsNew = asyncSingletonProxy(SimplifiedApexInspectionsNewClass);
