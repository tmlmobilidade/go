/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type RawApexTransaction, RawApexTransactionSchema } from '@tmlmobilidade/go-types-apex';
import { type RawVehicleEvent, RawVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class RawDatabase {
	//

	//
	// Collections
	public readonly rawApexTransactions: MongoInterfaceTemplate<RawApexTransaction, RawApexTransaction>;
	public readonly rawVehicleEvents: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;

	//
	private readonly database: Db;
	private readonly databaseName = 'raw';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.rawApexTransactions = new MongoInterfaceTemplate<RawApexTransaction, RawApexTransaction>('raw-apex-transactions', this.database, RawApexTransactionSchema);
		this.rawVehicleEvents = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('raw-vehicle-events', this.database, RawVehicleEventSchema);
	}
}
