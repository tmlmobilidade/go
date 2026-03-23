/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseColumn } from '@/types/index.js';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseColumn<SimplifiedApexValidation>[] = [
	{ name: '_id', primaryKey: true, type: 'String' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'apex_version', type: 'String' },
	{ name: 'card_serial_number', type: 'String' },
	{ name: 'category', type: 'String' },
	{ name: 'created_at', type: 'Int64' },
	{ name: 'device_id', type: 'String' },
	{ name: 'event_type', type: 'Int64' },
	{ name: 'is_passenger', type: 'Bool' },
	{ name: 'line_id', type: 'String' },
	{ name: 'mac_ase_counter_value', type: 'Int64' },
	{ name: 'mac_sam_serial_number', type: 'Int64' },
	{ name: 'on_board_refund_id', type: 'Nullable(String)' },
	{ name: 'on_board_sale_id', type: 'Nullable(String)' },
	{ name: 'pattern_id', type: 'String' },
	{ name: 'product_id', type: 'String' },
	{ name: 'received_at', type: 'Int64' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'units_qty', type: 'Nullable(Int64)' },
	{ name: 'updated_at', type: 'Int64' },
	{ name: 'validation_status', type: 'Int64' },
	{ name: 'vehicle_id', type: 'Int64' },
];

/* * */

class SimplifiedApexValidationsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexValidation> {
	//

	private static _instance: null | Promise<SimplifiedApexValidationsNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'simplified_apex_validations';

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
