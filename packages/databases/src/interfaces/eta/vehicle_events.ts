/* eslint-disable perfectionist/sort-objects */
/* * */

import { ClickHouseSchema, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface EtaVehicleEvent {
	_id: string
	agency_id: string
	created_at: number
	hashed_shape_id: string
	latitude: number
	line_id: number
	longitude: number
	ride_id: string
	vehicle_id: string
}

const tableSchema: ClickHouseSchema<EtaVehicleEvent> = {
	_id: { type: 'String' },
	created_at: { type: 'UInt64' },
	agency_id: { type: 'String' },
	ride_id: { type: 'String' },
	hashed_shape_id: { type: 'String' },
	line_id: { type: 'UInt16' },
	latitude: { type: 'Float64' },
	longitude: { type: 'Float64' },
	vehicle_id: { type: 'String' },
};

/* * */

class ETAVehicleEventsClass extends ClickHouseInterfaceTemplate<EtaVehicleEvent> {
	//

	private static _instance: null | Promise<ETAVehicleEventsClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly manageSchema = false;
	public override readonly orderBy = '_id';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'vehicle_events';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETAVehicleEventsClass();
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

	/**
	 * Clears all data from the table.
	 * @returns A promise that resolves when the data is cleared.
	 */
	public async clearData(): Promise<void> {
		const client = await this.getClient();

		await client.command({
			query: `TRUNCATE TABLE "${this.databaseName}"."${this.tableName}"`,
		});
	}

	protected override connectToClient() {
		return GOClickHouseClient.getClient();
	}

	//
}

/* * */

export const etaVehicleEvents = asyncSingletonProxy(ETAVehicleEventsClass);
