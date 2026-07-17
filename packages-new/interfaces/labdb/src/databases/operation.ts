/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedVehicleEventSchema } from '@/types/operation.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class OperationDatabase {
	//

	//
	// Collections
	public readonly vehicleEvents: ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>;

	//
	private readonly databaseName = 'operation';

	public constructor(instance: ClickHouseClient) {
		// Create collection interfaces
		this.vehicleEvents = new ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>(instance, this.databaseName, 'simplified_vehicle_events', simplifiedVehicleEventSchema, {
			engine: 'ReplacingMergeTree(created_at)',
			orderBy: ['operational_date', 'trip_id', 'vehicle_id', 'agency_id', 'created_at'],
			partitionBy: 'toYYYYMM(fromUnixTimestamp64Milli(created_at))',
			primaryKey: ['operational_date', 'trip_id', 'vehicle_id'],
		});
	}
}
