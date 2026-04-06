/* * */

import { ClickHouseSchema, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { Ride } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseSchema<Partial<Ride>> = {
	_id: { type: 'String' },
	end_time_scheduled: { type: 'UInt64' },
	hashed_shape_id: { type: 'String' },
	hashed_trip_id: { type: 'String' },
	headsign: { type: 'String' },
	line_id: { type: 'UInt16' },
	operational_date: { type: 'String' },
	start_time_observed: { type: 'UInt64' },
	start_time_scheduled: { type: 'UInt64' },
};

/* * */

class ETADailyRidesClass extends ClickHouseInterfaceTemplate<Partial<Ride>> {
	//

	private static _instance: null | Promise<ETADailyRidesClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly orderBy = '_id';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'daily_rides';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETADailyRidesClass();
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

	protected override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Vehicle Events...');
	}

	//
}

/* * */

export const etaDailyRides = asyncSingletonProxy(ETADailyRidesClass);
