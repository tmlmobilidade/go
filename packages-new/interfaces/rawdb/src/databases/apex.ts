/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type RawApexTransaction, RawApexTransactionSchema } from '@tmlmobilidade/go-types-apex';

/* * */

export class ApexDatabase {
	//

	//
	// Collections
	public readonly transactions: MongoInterfaceTemplate<RawApexTransaction, RawApexTransaction>;

	//
	private readonly database: Db;
	private readonly databaseName = 'apex';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.transactions = new MongoInterfaceTemplate<RawApexTransaction, RawApexTransaction>('transactions', this.database, RawApexTransactionSchema);
	}
}
