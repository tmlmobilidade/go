/* * */

import { ClickHouseSchema, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { HashedTripWaypoint } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

export type DailyTripWaypoint = HashedTripWaypoint & { hashed_trip_id: string };

const tableSchema: ClickHouseSchema<DailyTripWaypoint> = {
	arrival_time: { type: 'String' },
	departure_time: { type: 'String' },
	drop_off_type: { type: 'UInt8' },
	hashed_trip_id: { type: 'String' },
	pickup_type: { type: 'UInt8' },
	shape_dist_traveled: { type: 'Float64' },
	stop_id: { type: 'String' },
	stop_lat: { type: 'Float64' },
	stop_lon: { type: 'Float64' },
	stop_name: { type: 'String' },
	stop_sequence: { type: 'UInt16' },
	timepoint: { type: 'UInt8' },
};

/* * */

class ETADailyRidesWaypointsClass extends ClickHouseInterfaceTemplate<DailyTripWaypoint> {
	//

	private static _instance: null | Promise<ETADailyRidesWaypointsClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly orderBy = 'hashed_trip_id, stop_sequence';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'daily_rides_waypoints';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETADailyRidesWaypointsClass();
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

export const etaDailyRidesWaypoints = asyncSingletonProxy(ETADailyRidesWaypointsClass);
