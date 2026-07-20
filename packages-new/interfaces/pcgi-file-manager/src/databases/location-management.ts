/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type PcgiTransactionEntity } from '@tmlmobilidade/go-types-apex';

/* * */

export class FileManagementDatabase {
	//

	public readonly transactionEntity: MongoInterfaceTemplate<PcgiTransactionEntity>;

	private readonly database: Db;
	private readonly databaseName = 'FileManagement';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.transactionEntity = new MongoInterfaceTemplate<any, any>('transactionEntity', this.database, null, null);
	}
}
