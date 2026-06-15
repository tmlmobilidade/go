/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexInspection> = {
	_id: { primaryKey: true, type: 'String' },
	agency_id: { type: 'String' },
	apex_version: { type: 'String' },
	card_serial_number: { type: 'String' },
	control_destination_stop_id: { type: 'String' },
	control_origin_stop_id: { type: 'String' },
	control_status: { type: 'Int64' },
	created_at: { type: 'Int64' },
	device_id: { type: 'String' },
	environment_status: { type: 'Int64' },
	inspection_id: { type: 'String' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	line_id: { type: 'String' },
	mac_ase_counter_value: { type: 'Int64' },
	mac_sam_serial_number: { type: 'Int64' },
	pattern_id: { type: 'String' },
	product_id: { type: 'String' },
	received_at: { type: 'Int64' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'String' },
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
