/* * */

import { stopsIndexes } from '@/indexes/index.js';
import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type CreateStopDto, CreateStopSchema, type Stop, type UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/go-types-infrastructure';

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
		this.stops = new MongoInterfaceTemplate<Stop, CreateStopDto, UpdateStopDto>('stops', this.database, CreateStopSchema, UpdateStopSchema, stopsIndexes);
	}
}
