/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/types';

/* * */

export class LocationsDatabase {
	//

	public readonly districts: MongoInterfaceTemplate<District, null, null>;
	public readonly localities: MongoInterfaceTemplate<Locality, null, null>;
	public readonly municipalities: MongoInterfaceTemplate<Municipality, null, null>;
	public readonly parishes: MongoInterfaceTemplate<Parish, null, null>;

	private readonly database: Db;
	private readonly databaseName = 'locations';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.districts = new MongoInterfaceTemplate<District, null, null>('districts', this.database, null, null);
		this.localities = new MongoInterfaceTemplate<Locality, null, null>('localities', this.database, null, null);
		this.municipalities = new MongoInterfaceTemplate<Municipality, null, null>('municipalities', this.database, null, null);
		this.parishes = new MongoInterfaceTemplate<Parish, null, null>('parishes', this.database, null, null);
	}
}

