/* * */

import type { Db } from 'mongodb';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { CreateStopDto, CreateStopSchema, Stop, UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
/* * */

export class InfrastructureDatabase {
	//

	//
	// Collections
	public readonly stops: MongoInterfaceTemplate<Stop, CreateStopDto, UpdateStopDto>;

	//
	private readonly database: Db;
	private readonly databaseName = 'infrastructure';

	public constructor(instance: MongoConnector) {
		// Create the database instance
		this.database = instance.client.db(this.databaseName);

		// Create collection interfaces
		this.stops = new MongoInterfaceTemplate<Stop, CreateStopDto, UpdateStopDto>('stops', this.database, CreateStopSchema, UpdateStopSchema);
	}
}
