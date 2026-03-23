/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseColumn } from '@/types/index.js';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';

/* * */

const tableSchema: ClickHouseColumn<SimplifiedApexOnBoardSale>[] = [
	{ name: '_id', type: 'String' },
	{ name: 'created_at', type: 'String' },
	{ name: 'updated_at', type: 'String' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'apex_version', type: 'String' },
	{ name: 'device_id', type: 'String' },
	{ name: 'line_id', type: 'String' },
	{ name: 'mac_ase_counter_value', type: 'String' },
	{ name: 'mac_sam_serial_number', type: 'String' },
	{ name: 'pattern_id', type: 'String' },
	{ name: 'received_at', type: 'String' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'vehicle_id', type: 'String' },
	{ name: 'block_id', type: 'String' },
	{ name: 'card_physical_type', type: 'String' },
	{ name: 'card_serial_number', type: 'String' },
	{ name: 'duty_id', type: 'String' },
	{ name: 'payment_method', type: 'String' },
	{ name: 'price', type: 'String' },
	{ name: 'product_long_id', type: 'String' },
	{ name: 'product_quantity', type: 'String' },
	{ name: 'validation_id', type: 'String' },
	{ name: 'is_passenger', type: 'String' },
	{ name: 'on_board_refund_id', type: 'String' },
];

/* * */

class SimplifiedApexOnBoardSalesNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexOnBoardSale> {
	//

	private static _instance: null | Promise<SimplifiedApexOnBoardSalesNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'simplified_apex_on_board_sales';

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

export const simplifiedApexOnBoardSalesNew = await SimplifiedApexOnBoardSalesNewClass.getInstance();
