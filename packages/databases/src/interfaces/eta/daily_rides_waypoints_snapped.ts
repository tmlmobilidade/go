/* eslint-disable perfectionist/sort-objects */
/* * */

import { ClickHouseSchema, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface ETADailyRidesWaypointSnapped {
	arrival_time: string
	departure_time: string
	hashed_shape_id: string
	hashed_trip_id: string
	node_index: number
	stop_id: string
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_sequence: number
}

const tableSchema: ClickHouseSchema<ETADailyRidesWaypointSnapped> = {
	hashed_trip_id: { type: 'String' },
	hashed_shape_id: { type: 'String' },
	stop_sequence: { type: 'UInt16' },
	stop_id: { type: 'String' },
	stop_name: { type: 'String' },
	stop_lat: { type: 'Float64' },
	stop_lon: { type: 'Float64' },
	node_index: { type: 'UInt32' },
	arrival_time: { type: 'String' },
	departure_time: { type: 'String' },
};

/* * */

class ETADailyRidesWaypointsSnappedClass extends ClickHouseInterfaceTemplate<ETADailyRidesWaypointSnapped> {
	//

	private static _instance: null | Promise<ETADailyRidesWaypointsSnappedClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly engine = 'ReplacingMergeTree';
	public override readonly manageSchema = false;
	public override readonly orderBy = 'hashed_trip_id, stop_sequence';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'daily_rides_waypoints_snapped';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETADailyRidesWaypointsSnappedClass();
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

export const etaDailyRidesWaypointsSnapped = asyncSingletonProxy(ETADailyRidesWaypointsSnappedClass);
