/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema, ClickHouseTableEngine } from '@/types/index.js';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexValidation> = {
	_id: { type: 'String' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_version: { type: 'LowCardinality(String)' },
	calendar_date: { type: 'Date' },
	card_serial_number: { type: 'Nullable(UInt64)' },
	category: { type: 'LowCardinality(String)' },
	created_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	device_id: { type: 'LowCardinality(String)' },
	event_type: { type: 'Int64' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	is_passenger: { type: 'Bool' },
	line_id: { type: 'Nullable(LowCardinality(String))' },
	mac_ase_counter_value: { type: 'Int64' },
	mac_sam_serial_number: { type: 'Int64' },
	on_board_refund_id: { type: 'Nullable(String)' },
	on_board_sale_id: { type: 'Nullable(String)' },
	pattern_id: { type: 'Nullable(LowCardinality(String))' },
	product_id: { type: 'Nullable(LowCardinality(String))' },
	received_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	stop_id: { type: 'Nullable(LowCardinality(String))' },
	trip_id: { type: 'Nullable(String)' },
	units_qty: { type: 'Nullable(Int64)' },
	validation_status: { type: 'Int64' },
	vehicle_id: { type: 'Int64' },
};

/* * */

class SimplifiedApexValidationsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexValidation> {
	//

	private static _instance: null | Promise<SimplifiedApexValidationsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly engine: ClickHouseTableEngine = 'ReplacingMergeTree';
	protected override readonly orderBy = '(agency_id, calendar_date)';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'validations';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			console.log('create instance here');
			this._instance = (async () => {
				const instance = new SimplifiedApexValidationsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex Validations...');
	}

	//
}

/* * */

export const simplifiedApexValidationsNew = asyncSingletonProxy(SimplifiedApexValidationsNewClass);
