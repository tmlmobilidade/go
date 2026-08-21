/* * */

import { districtsIndexes, localitiesIndexes, municipalitiesIndexes, parishesIndexes } from '@/indexes/index.js';
import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type DistrictFeature, type LocalityFeature, type MunicipalityFeature, type ParishFeature } from '@tmlmobilidade/go-types-locations';

/* * */

export class LocationsDatabase {
	//

	public readonly districts: MongoInterfaceTemplate<DistrictFeature, null, null>;
	public readonly localities: MongoInterfaceTemplate<LocalityFeature, null, null>;
	public readonly municipalities: MongoInterfaceTemplate<MunicipalityFeature, null, null>;
	public readonly parishes: MongoInterfaceTemplate<ParishFeature, null, null>;

	private readonly database: Db;
	private readonly databaseName = 'locations';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.districts = new MongoInterfaceTemplate<DistrictFeature, null, null>('districts', this.database, null, null, districtsIndexes);
		this.localities = new MongoInterfaceTemplate<LocalityFeature, null, null>('localities', this.database, null, null, localitiesIndexes);
		this.municipalities = new MongoInterfaceTemplate<MunicipalityFeature, null, null>('municipalities', this.database, null, null, municipalitiesIndexes);
		this.parishes = new MongoInterfaceTemplate<ParishFeature, null, null>('parishes', this.database, null, null, parishesIndexes);
	}
}

