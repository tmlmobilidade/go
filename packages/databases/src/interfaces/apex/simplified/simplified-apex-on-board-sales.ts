/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexOnBoardSale> = {
	_id: { primaryKey: true, type: 'String' },
	agency_id: { type: 'String' },
	apex_version: { type: 'String' },
	block_id: { type: 'String' },
	card_physical_type: { type: 'String' },
	card_serial_number: { type: 'String' },
	created_at: { type: 'Int64' },
	device_id: { type: 'String' },
	duty_id: { type: 'String' },
	is_passenger: { type: 'Bool' },
	line_id: { type: 'String' },
	mac_ase_counter_value: { type: 'Int64' },
	mac_sam_serial_number: { type: 'Int64' },
	on_board_refund_id: { type: 'Nullable(String)' },
	pattern_id: { type: 'String' },
	payment_method: { type: 'String' },
	price: { type: 'Int64' },
	product_long_id: { type: 'String' },
	product_quantity: { type: 'Int64' },
	received_at: { type: 'Int64' },
	stop_id: { type: 'String' },
	trip_id: { type: 'String' },
	updated_at: { type: 'Int64' },
	validation_id: { type: 'Nullable(String)' },
	vehicle_id: { type: 'String' },
};

/* * */

class SimplifiedApexOnBoardSalesNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale> {
	//

	private static _instance: null | Promise<SimplifiedApexOnBoardSalesNewClass> = null;

	protected override readonly databaseName = 'operation';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'simplified_apex_on_board_sales';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexOnBoardSalesNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex OnBoardSales...');
	}

	//
}

/* * */

export const simplifiedApexOnBoardSalesNew = asyncSingletonProxy(SimplifiedApexOnBoardSalesNewClass);
