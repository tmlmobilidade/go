/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<SimplifiedVehicleEvent> = {
	_id: { type: 'String' },
	agency_id: { type: 'LowCardinality(String)' },
	bearing: { type: 'Nullable(UInt16 CODEC(T64, ZSTD))' },
	created_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	current_status: { type: 'LowCardinality(Nullable(String))' },
	driver_id: { type: 'LowCardinality(Nullable(String))' },
	extra_trip_id: { type: 'Nullable(String)' },
	geohash: { materialized: 'geohashEncode(longitude, latitude, 7)', type: 'FixedString(7)' },
	latitude: { type: 'Float32 CODEC(Gorilla, ZSTD)' },
	longitude: { type: 'Float32 CODEC(Gorilla, ZSTD)' },
	odometer: { type: 'Nullable(UInt32)' },
	operational_date: { type: 'UInt32' },
	received_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	speed: { type: 'Nullable(UInt8 CODEC(T64, ZSTD))' },
	stop_id: { type: 'LowCardinality(Nullable(String))' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'LowCardinality(String)' },
};

/**
 * Simplified Vehicle Events represent a simplified version of the raw vehicle events.
 * These are stored in ClickHouse for performance and scalability reasons.
 */
class SimplifiedVehicleEventsNewClass extends ClickHouseInterfaceTemplate<SimplifiedVehicleEvent> {
	//

	private static _instance: null | Promise<SimplifiedVehicleEventsNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly engine: ClickHouseTableEngine<SimplifiedVehicleEvent> = 'ReplacingMergeTree(created_at)';
	public override readonly orderBy = 'agency_id, vehicle_id, trip_id, created_at, _id';
	public override readonly partitionBy = 'toDiv(operational_date, 100)';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'simplified_vehicle_events';

	/**
	 * Returns the last event for a given vehicle.
	 * @param vehicleId - The ID of the vehicle.
	 * @returns The last event for the vehicle.
	 */
	public async getLastEvent(vehicleId: string, agencyId: string): Promise<null | SimplifiedVehicleEvent> {
		const query = `
			SELECT *
			FROM "${this.databaseName}"."${this.tableName}"
			WHERE vehicle_id = '${vehicleId}'
			AND agency_id = '${agencyId}'
			ORDER BY created_at DESC
			LIMIT 1
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
	 * When bearing is missing, it is computed from the previous position of the same agency_id/vehicle_id
	 * pair if that event is at most 5 minutes older and the coordinates changed.
	 */
	public async getPositions(secondsAgo: number = 90): Promise<SimplifiedVehicleEvent[]> {
		const bearingInferenceLookbackSeconds = 300;
		const bearingInferenceMaxGapMs = bearingInferenceLookbackSeconds * 1000;
		const query = `
			SELECT *
			FROM (
				SELECT
					* REPLACE(
						coalesce(
							bearing,
							if(
								lagInFrame(created_at) OVER w IS NOT NULL
								AND (created_at - lagInFrame(created_at) OVER w) <= ${bearingInferenceMaxGapMs}
								AND (
									abs(latitude - lagInFrame(latitude) OVER w) > 0.000001
									OR abs(longitude - lagInFrame(longitude) OVER w) > 0.000001
								),
								toInt64(round(mod(
									360 + degrees(atan2(
										sin(radians(longitude - lagInFrame(longitude) OVER w)) * cos(radians(latitude)),
										cos(radians(lagInFrame(latitude) OVER w)) * sin(radians(latitude))
											- sin(radians(lagInFrame(latitude) OVER w)) * cos(radians(latitude))
												* cos(radians(longitude - lagInFrame(longitude) OVER w))
									)),
									360
								))),
								NULL
							)
						) AS bearing
					)
				FROM "${this.databaseName}"."${this.tableName}"
				WHERE created_at > toUnixTimestamp64Milli(now64(3) - INTERVAL ${secondsAgo + bearingInferenceLookbackSeconds} SECOND)
				WINDOW w AS (PARTITION BY agency_id, vehicle_id ORDER BY created_at)
			)
			WHERE created_at > toUnixTimestamp64Milli(now64(3) - INTERVAL ${secondsAgo} SECOND)
			ORDER BY created_at DESC
			LIMIT 1 BY agency_id, vehicle_id
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
