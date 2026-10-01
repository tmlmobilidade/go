/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type PcgiVehicleEvent, PcgiVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class CoreManagementCopyDatabase {
	//

	public readonly vehicleEvents: MongoInterfaceTemplate<PcgiVehicleEvent, PcgiVehicleEvent>;

	private readonly database: Db;
	private readonly databaseName = 'CoreManagement';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.vehicleEvents = new MongoInterfaceTemplate<PcgiVehicleEvent, PcgiVehicleEvent>('VehicleEvents', this.database, PcgiVehicleEventSchema);
	}
}
