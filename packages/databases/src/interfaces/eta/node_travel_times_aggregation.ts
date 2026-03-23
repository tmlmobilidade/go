/* * */

import { ClickHouseColumn, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface ETANodeTravelTimesAggregation {
	avg_travel_time_seconds: number
	day_type: string
	max_travel_time_seconds: number
	median_travel_time_seconds: number
	min_travel_time_seconds: number
	node_index: number
	operational_date: number
	period: string
	period_of_day: string
	shape_id: string
	weekday: string
}

const tableSchema: ClickHouseColumn<ETANodeTravelTimesAggregation>[] = [
	{ name: 'shape_id', type: 'String' },
	{ name: 'node_index', type: 'UInt32' },
	{ name: 'operational_date', type: 'UInt32' },
	{ name: 'period', type: 'String' },
	{ name: 'period_of_day', type: 'Enum8(\'Peak AM\' = 1, \'Mid\' = 2, \'Peak PM\' = 3, \'Off Peak\' = 4)' },
	{ name: 'weekday', type: 'Enum8(\'Monday\' = 1, \'Tuesday\' = 2, \'Wednesday\' = 3, \'Thursday\' = 4, \'Friday\' = 5, \'Saturday\' = 6, \'Sunday\' = 7)' },
	{ name: 'day_type', type: 'Enum8(\'Weekday\' = 1, \'Weekend\' = 2)' },
	{ name: 'avg_travel_time_seconds', type: 'Float64' },
	{ name: 'min_travel_time_seconds', type: 'Float64' },
	{ name: 'max_travel_time_seconds', type: 'Float64' },
	{ name: 'median_travel_time_seconds', type: 'Float64' },
];

/* * */

class ETANodeTravelTimesAggregationClass extends ClickHouseInterfaceTemplate<ETANodeTravelTimesAggregation> {
	//

	private static _instance: null | Promise<ETANodeTravelTimesAggregationClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'node_travel_times_aggregation';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETANodeTravelTimesAggregationClass();
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

export const etaNodeTravelTimesAggregation = asyncSingletonProxy(ETANodeTravelTimesAggregationClass);
