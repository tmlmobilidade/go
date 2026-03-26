/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseSchema } from '@/types/index.js';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<SimplifiedVehicleEvent> = {
	_id: { type: 'String' },
	agency_id: { type: 'String' },
	created_at: { type: 'Int64' },
	latitude: { type: 'Float64' },
	longitude: { type: 'Float64' },
	received_at: { type: 'Int64' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'String' },
	// Optional Fields
	bearing: { type: 'Nullable(Int64)' },
	current_status: { type: 'Nullable(String)' },
	door: { type: 'Nullable(String)' },
	driver_id: { type: 'Nullable(String)' },
	extra_trip_id: { type: 'Nullable(String)' },
	odometer: { type: 'Nullable(Float64)' },
	pattern_id: { type: 'Nullable(String)' },
	speed: { type: 'Nullable(Float64)' },
	stop_id: { type: 'Nullable(String)' },
};

/* * */

class SimplifiedVehicleEventsNewClass extends ClickHouseInterfaceTemplate<SimplifiedVehicleEvent> {
	//

	private static _instance: null | Promise<SimplifiedVehicleEventsNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly orderBy = '(created_at, trip_id)';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'simplified_vehicle_events';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedVehicleEventsNewClass();
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
		console.log('Post init ClickHouse service for Simplified Vehicle Events...');
	}

	//
}

/* * */

export const simplifiedVehicleEventsNew = asyncSingletonProxy(SimplifiedVehicleEventsNewClass);
