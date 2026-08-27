/* * */

import { districtsIndexes, localitiesIndexes, municipalitiesIndexes, parishesIndexes } from '@/indexes/index.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type DistrictFeature, type LocalityFeature, type MunicipalityFeature, type ParishFeature } from '@tmlmobilidade/go-types-locations';

import { createGoDbCollection } from '../factory/collections/create-godb-collection.js';
import { GoDbCollection } from '../factory/collections/types/godb-collection.type.js';

/* * */

export class LocationsDatabase {
	//

	public readonly districts: GoDbCollection<DistrictFeature>;
	public readonly localities: GoDbCollection<LocalityFeature>;
	public readonly municipalities: GoDbCollection<MunicipalityFeature>;
	public readonly parishes: GoDbCollection<ParishFeature>;

	private readonly database: Db;
	private readonly databaseName = 'locations';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.districts = createGoDbCollection<DistrictFeature>({ collectionName: 'districts', database: this.database, indexDescription: districtsIndexes, schema: null });
		this.localities = createGoDbCollection<LocalityFeature>({ collectionName: 'localities', database: this.database, indexDescription: localitiesIndexes, schema: null });
		this.municipalities = createGoDbCollection<MunicipalityFeature>({ collectionName: 'municipalities', database: this.database, indexDescription: municipalitiesIndexes, schema: null });
		this.parishes = createGoDbCollection<ParishFeature>({ collectionName: 'parishes', database: this.database, indexDescription: parishesIndexes, schema: null });
	}
}

