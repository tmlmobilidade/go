/* * */

import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type Annotation, AnnotationSchema, type Holiday, HolidaySchema } from '@tmlmobilidade/go-types-dates';

import { createGoDbCollection } from '../factory/create-godb-collection.js';
import { type GoDbCollection } from '../factory/types/godb-collection.type.js';

/* * */

export class DatesDatabase {
	//

	public readonly annotations: GoDbCollection<Annotation>;
	public readonly holidays: GoDbCollection<Holiday>;

	private readonly database: Db;
	private readonly databaseName = 'dates';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.annotations = createGoDbCollection<Annotation>({ collectionName: 'annotations', database: this.database, indexDescription: null, schema: AnnotationSchema });
		this.holidays = createGoDbCollection<Holiday>({ collectionName: 'holidays', database: this.database, indexDescription: null, schema: HolidaySchema });
	}
}
