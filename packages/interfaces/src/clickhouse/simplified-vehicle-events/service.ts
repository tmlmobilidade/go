/* * */

import { simplifiedVehicleEventsSchema } from '@/clickhouse/simplified-vehicle-events/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

class SimplifiedVehicleEventsNewClass extends ClickHouseTable<SimplifiedVehicleEvent> {
	//

	override databaseName = 'operation';
	override schema = simplifiedVehicleEventsSchema;
	override tableName = 'simplified_vehicle_events';

	public override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Vehicle Events...');
	}

	//
}

/* * */

export const simplifiedVehicleEventsNew = new SimplifiedVehicleEventsNewClass();
