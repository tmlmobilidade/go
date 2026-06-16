/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedApexInspectionDecision } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedApexInspectionDecision> = {
	_id: { type: 'String' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_version: { type: 'LowCardinality(String)' },
	calendar_date: { type: 'Date' },
	created_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
	device_id: { type: 'LowCardinality(String)' },
	final_control_status: { type: 'Int64' },
	inspection_decision_id: { type: 'Nullable(String)' },
	is_ok: { type: 'Bool' },
	is_ok_pcgi: { type: 'Bool' },
	mac_ase_counter_value: { type: 'Int64' },
	mac_sam_serial_number: { type: 'Int64' },
	received_at: { type: 'DateTime64(3, \'UTC\') CODEC(Delta, ZSTD)' },
};

/* * */

class SimplifiedApexInspectionDecisionsNewClass extends ClickHouseInterfaceTemplate<SimplifiedApexInspectionDecision> {
	//

	private static _instance: null | Promise<SimplifiedApexInspectionDecisionsNewClass> = null;

	protected override readonly databaseName = 'simplified_apex';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'inspection_decisions';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexInspectionDecisionsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Apex Inspection Decisions...');
	}

	//
}

/* * */

export const simplifiedApexInspectionDecisionsNew = asyncSingletonProxy(SimplifiedApexInspectionDecisionsNewClass);
