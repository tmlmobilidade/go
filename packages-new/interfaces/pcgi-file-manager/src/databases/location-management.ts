/* * */

import type { Db, MongoClient } from '@tmlmobilidade/go-clients-mongo';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import z from 'zod';

/* * */

export class LocationManagementDatabase {
	//

	//
	// Collections
	public readonly locationEntity: MongoInterfaceTemplate<any, any>;

	//
	private readonly database: Db;
	private readonly databaseName = 'locationManagement';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.locationEntity = new MongoInterfaceTemplate<any, any>('locationEntities', this.database, z.any());
	}
}
