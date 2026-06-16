/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexBankingTap> = {
	_id: { primaryKey: true, type: 'String' },
	agency_id: { type: 'String' },
	apex_version: { type: 'String' },
	banking_token: { type: 'String' },
	calendar_date: { type: 'String' },
	card_brand: { type: 'Int64' },
	card_pan: { type: 'String' },
	created_at: { type: 'Int64' },
	device_id: { type: 'String' },
	event_type: { type: 'Int64' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	line_id: { type: 'String' },
	mac_ase_counter_value: { type: 'Int64' },
	mac_sam_serial_number: { type: 'Int64' },
	pattern_id: { type: 'String' },
	product_id: { type: 'String' },
	received_at: { type: 'Int64' },
	stop_id: { type: 'String' },
	trip_id: { type: 'String' },
	units_qty: { type: 'Int64' },
	vehicle_id: { type: 'String' },
};

/* * */

class SimplifiedApexBankingTapsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexBankingTap> {
	//

	private static _instance: null | Promise<SimplifiedApexBankingTapsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'banking_taps';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexBankingTapsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex Banking Taps...');
	}

	//
}

/* * */

export const simplifiedApexBankingTapsNew = asyncSingletonProxy(SimplifiedApexBankingTapsNewClass);
