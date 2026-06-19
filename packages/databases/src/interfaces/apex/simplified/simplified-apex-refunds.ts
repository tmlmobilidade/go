/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<SimplifiedApexOnBoardRefund> = {
	_id: { type: 'UUID' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_version: { type: 'LowCardinality(String)' },
	card_physical_type: { type: 'UInt8' },
	card_serial_number: { type: 'Nullable(UInt64)' },
	created_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	device_id: { type: 'LowCardinality(String)' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	line_id: { type: 'LowCardinality(Nullable(String))' },
	mac_ase_counter_value: { type: 'UInt64' },
	mac_sam_serial_number: { type: 'UInt64' },
	on_board_sale_id: { type: 'Nullable(UUID)' },
	operational_date: { type: 'UInt32' },
	pattern_id: { type: 'LowCardinality(Nullable(String))' },
	payment_method: { type: 'UInt8' },
	price: { type: 'Int32' },
	product_id: { type: 'LowCardinality(Nullable(String))' },
	product_quantity: { type: 'Int32' },
	received_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	stop_id: { type: 'LowCardinality(Nullable(String))' },
	trip_id: { type: 'Nullable(String)' },
	updated_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	validation_id: { type: 'Nullable(UUID)' },
	vehicle_id: { type: 'LowCardinality(Nullable(String))' },
};

/* * */

class SimplifiedApexOnBoardRefundsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexOnBoardRefund> {
	//

	private static _instance: null | Promise<SimplifiedApexOnBoardRefundsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly engine: ClickHouseTableEngine<SimplifiedApexOnBoardRefund> = 'ReplacingMergeTree(updated_at)';
	protected override readonly orderBy = 'agency_id, transaction_date, _id';
	protected override readonly partitionBy = 'toYYYYMM(transaction_date)';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'refunds';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexOnBoardRefundsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex OnBoardRefunds...');
	}

	//
}

/* * */

export const simplifiedApexOnBoardRefundsNew = asyncSingletonProxy(SimplifiedApexOnBoardRefundsNewClass);
