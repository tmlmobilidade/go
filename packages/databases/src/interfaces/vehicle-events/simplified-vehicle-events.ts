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
	odometer: { type: 'Nullable(Int64)' },
	pattern_id: { type: 'Nullable(String)' },
	speed: { type: 'Nullable(Int64)' },
	stop_id: { type: 'Nullable(String)' },
};

/* * */

class SimplifiedVehicleEventsNewClass extends ClickHouseInterfaceTemplate<SimplifiedVehicleEvent> {
	//

	private static _instance: null | Promise<SimplifiedVehicleEventsNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly orderBy = '(created_at, trip_id)';
	public override readonly partitionBy = 'toYYYYMMDD(fromUnixTimestamp64Milli(created_at))';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'simplified_vehicle_events';

	/**
	 * Returns the last event for a given vehicle.
	 * @param vehicleId - The ID of the vehicle.
	 * @returns The last event for the vehicle.
	 */
	public async getLastEvent(vehicleId: string): Promise<null | SimplifiedVehicleEvent> {
		const query = `
			SELECT *
			FROM "${this.databaseName}"."${this.tableName}"
			WHERE vehicle_id = '${vehicleId}'
				AND agency_id NOT IN ('', NULL)
				AND trip_id NOT IN ('', NULL)
				AND floor(latitude) != 0 AND floor(longitude) != 0
			ORDER BY agency_id, vehicle_id, trip_id, created_at DESC
			LIMIT 1 BY vehicle_id
		`;
		const result = await this.queryFromString<SimplifiedVehicleEvent>(query);
		return result.length > 0 ? result[0] : null;
	}

	/**
	 * Retrieves the most recent event per vehicle within the given time window.
	 *
	 * @param secondsAgo - The number of seconds in the past to consider for retrieving recent positions. Defaults to 90 seconds.
	 * @returns A promise resolving to an array of SimplifiedVehicleEvent objects, each representing the latest event for a vehicle within the specified period.
	 *
	 * The method filters out events where any of vehicle_id, agency_id, or trip_id are empty or null,
	 * and also ensures latitude and longitude are not zero. Only the most recent event per vehicle is returned.
	 */
	public async getPositions(secondsAgo: number = 90): Promise<SimplifiedVehicleEvent[]> {
		const query = `
			SELECT *
			FROM "${this.databaseName}"."${this.tableName}"
			WHERE created_at > toUnixTimestamp64Milli(now64(3) - INTERVAL ${secondsAgo} SECOND)
				AND vehicle_id NOT IN ('', NULL)
				AND agency_id NOT IN ('', NULL)
				AND trip_id NOT IN ('', NULL)
				AND floor(latitude) != 0 AND floor(longitude) != 0
			ORDER BY agency_id, vehicle_id, trip_id, created_at DESC
			LIMIT 1 BY vehicle_id
			`;

		const result = await this.queryFromString<SimplifiedVehicleEvent>(query);
		return result;
	}

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
