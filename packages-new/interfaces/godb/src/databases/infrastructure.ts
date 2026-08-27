/* * */

import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Stop, StopSchema } from '@tmlmobilidade/go-types-infrastructure';

import { createGoDbCollection } from '../factory/create-godb-collection.js';
import { type GoDbCollection } from '../factory/types/godb-collection.type.js';
import { stopsIndexes } from '../indexes/index.js';

/* * */

export class InfrastructureDatabase {
	//

	public readonly stops: GoDbCollection<Stop>;

	private readonly database: Db;
	private readonly databaseName = 'infrastructure';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.stops = createGoDbCollection<Stop>({ collectionName: 'stops', database: this.database, indexDescription: stopsIndexes, schema: StopSchema });
	}
}
