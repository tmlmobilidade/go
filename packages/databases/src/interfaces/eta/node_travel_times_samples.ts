/* * */

import { ClickHouseColumn, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface ETANodeTravelTimesSample {
	created_at: number
	event_id: string
	hashed_shape_id: string
	hour: number
	latitude: number
	longitude: number
	node_index: number
	ride_id: string
	speed_kmh: number
	travel_time_seconds: number
}

const tableSchema: ClickHouseColumn<ETANodeTravelTimesSample>[] = [
	{ name: 'event_id', type: 'String' },
	{ name: 'ride_id', type: 'String' },
	{ name: 'hashed_shape_id', type: 'String' },
	{ name: 'node_index', type: 'UInt32' },
	{ name: 'hour', type: 'UInt8' },
	{ name: 'created_at', type: 'UInt64' },
	{ name: 'travel_time_seconds', type: 'Float64' },
	{ name: 'speed_kmh', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
	{ name: 'longitude', type: 'Float64' },
];

/* * */

class ETANodeTravelTimesSamplesClass extends ClickHouseInterfaceTemplate<ETANodeTravelTimesSample> {
	//

	private static _instance: null | Promise<ETANodeTravelTimesSamplesClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'node_travel_times_samples';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETANodeTravelTimesSamplesClass();
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

export const etaNodeTravelTimesSamples = asyncSingletonProxy(ETANodeTravelTimesSamplesClass);
