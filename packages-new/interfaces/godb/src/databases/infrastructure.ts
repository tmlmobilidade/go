/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { CreateStopDto, CreateStopSchema, Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';

/* * */

export class InfrastructureDatabase {
	//

	public readonly stops: MongoInterfaceTemplate<Stop, CreateStopDto, UpdateStopDto>;

	private readonly database: Db;
	private readonly databaseName = 'infrastructure';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.stops = new MongoInterfaceTemplate<Stop, CreateStopDto, UpdateStopDto>('stops', this.database, CreateStopSchema, UpdateStopSchema);
	}
}
