/* * */

import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type MetricDocument, MetricDocumentSchema } from '@tmlmobilidade/go-types-performance';

import { createGoDbCollection } from '../factory/create-godb-collection.js';
import { type GoDbCollection } from '../factory/types/godb-collection.type.js';
import { metricsIndexes } from '../indexes/performance/index.js';

/* * */

export class PerformanceDatabase {
	//

	public readonly metrics: GoDbCollection<MetricDocument>;

	private readonly database: Db;
	private readonly databaseName = 'performance';

	public constructor(instance: MongoClient) {
		this.database = instance.db(this.databaseName);
		this.metrics = createGoDbCollection<MetricDocument>({ collectionName: 'metrics', database: this.database, indexDescription: metricsIndexes, schema: MetricDocumentSchema });
	}
}
