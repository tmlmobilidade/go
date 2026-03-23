/* * */

import { ClickHouseColumn, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { Ride } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseColumn<Partial<Ride>>[] = [
	{ name: '_id', type: 'String' },
	{ name: 'hashed_trip_id', type: 'String' },
	{ name: 'hashed_shape_id', type: 'String' },
	{ name: 'line_id', type: 'UInt16' },
	{ name: 'operational_date', type: 'String' },
	{ name: 'start_time_scheduled', type: 'UInt64' },
	{ name: 'end_time_scheduled', type: 'UInt64' },
	{ name: 'start_time_observed', type: 'UInt64' },
	{ name: 'headsign', type: 'String' },
];

/* * */

class ETADailyRidesClass extends ClickHouseInterfaceTemplate<Partial<Ride>> {
	//

	private static _instance: null | Promise<ETADailyRidesClass> = null;

	public override readonly databaseName = 'eta';
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
