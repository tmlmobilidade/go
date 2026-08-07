/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedVehicleEventTableSchema } from '@/schemas/operation.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class OperationDatabase {
	//

	public readonly vehicleEvents: ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>;

	private readonly databaseName = 'operation';

	public constructor(instance: ClickHouseClient) {
		this.vehicleEvents = new ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>(instance, this.databaseName, 'simplified_vehicle_events', simplifiedVehicleEventTableSchema, {
			engine: 'ReplacingMergeTree(created_at)',
			orderBy: ['agency_id', 'operational_date', 'vehicle_id', 'created_at', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
	}

	public async init() {
		await this.vehicleEvents.init();
	}
}
