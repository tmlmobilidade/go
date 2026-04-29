/* eslint-disable perfectionist/sort-objects */
/* * */

import { ClickHouseSchema, GOClickHouseClient } from '@/index.js';
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

const tableSchema: ClickHouseSchema<ETANodeTravelTimesAggregation> = {
	shape_id: { type: 'String' },
	node_index: { type: 'UInt32' },
	operational_date: { type: 'UInt32' },
	period: { type: 'String' },
	period_of_day: { type: 'Enum8(\'Peak AM\' = 1, \'Mid\' = 2, \'Peak PM\' = 3, \'Off Peak\' = 4)' },
	weekday: { type: 'Enum8(\'Monday\' = 1, \'Tuesday\' = 2, \'Wednesday\' = 3, \'Thursday\' = 4, \'Friday\' = 5, \'Saturday\' = 6, \'Sunday\' = 7)' },
	day_type: { type: 'Enum8(\'Weekday\' = 1, \'Weekend\' = 2)' },
	avg_travel_time_seconds: { type: 'Float64' },
	min_travel_time_seconds: { type: 'Float64' },
	max_travel_time_seconds: { type: 'Float64' },
	median_travel_time_seconds: { type: 'Float64' },
};

/* * */

class ETANodeTravelTimesAggregationClass extends ClickHouseInterfaceTemplate<ETANodeTravelTimesAggregation> {
	//

	private static _instance: null | Promise<ETANodeTravelTimesAggregationClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly manageSchema = false;
	public override readonly orderBy = 'shape_id, node_index, operational_date, period, period_of_day, weekday, day_type';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'node_travel_times_aggregates';

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

	//
}

/* * */

export const etaNodeTravelTimesAggregation = asyncSingletonProxy(ETANodeTravelTimesAggregationClass);
