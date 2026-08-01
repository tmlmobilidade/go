/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedVehicleEventTableSchema } from '@/schemas/operation.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type RideAnalysisAtLeastOneVehicleEventOnFirstStop } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Ride } from '@tmlmobilidade/types';

/* * */

export class OperationDatabase {
	//

	public readonly rideAnalysisAtLeastOneVehicleEventOnFirstStop: ClickHouseInterfaceTemplate<RideAnalysisAtLeastOneVehicleEventOnFirstStop>;
	public readonly rides: ClickHouseInterfaceTemplate<Ride>;
	public readonly simplifiedVehicleEvents: ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>;

	private readonly databaseName = 'operation';

	public constructor(instance: ClickHouseClient) {
		this.simplifiedVehicleEvents = new ClickHouseInterfaceTemplate<SimplifiedVehicleEvent>(instance, this.databaseName, 'simplified_vehicle_events', simplifiedVehicleEventTableSchema, {
			engine: 'ReplacingMergeTree(created_at)',
			orderBy: ['agency_id', 'operational_date', 'vehicle_id', 'created_at', '_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
	}

	public async init() {
		await this.simplifiedVehicleEvents.init();
		await this.rides.init();
	}
}
