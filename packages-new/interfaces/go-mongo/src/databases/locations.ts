/* * */

import type { Db } from 'mongodb';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { District, Locality, Municipality, Parish } from '@tmlmobilidade/types';
/* * */

export class LocationsDatabase {
	//

	//
	// Collections

	public readonly districts: MongoInterfaceTemplate<District, null, null>;
	public readonly localities: MongoInterfaceTemplate<Locality, null, null>;
	public readonly municipalities: MongoInterfaceTemplate<Municipality, null, null>;
	public readonly parishes: MongoInterfaceTemplate<Parish, null, null>;

	//
	private readonly database: Db;
	private readonly databaseName = 'locations';

	public constructor(instance: MongoConnector) {
		// Create the database instance
		this.database = instance.client.db(this.databaseName);

		// Create collection interfaces
		this.districts = new MongoInterfaceTemplate<District, null, null>('districts', this.database, null, null);
		this.localities = new MongoInterfaceTemplate<Locality, null, null>('localities', this.database, null, null);
		this.municipalities = new MongoInterfaceTemplate<Municipality, null, null>('municipalities', this.database, null, null);
		this.parishes = new MongoInterfaceTemplate<Parish, null, null>('parishes', this.database, null, null);
	}
}

