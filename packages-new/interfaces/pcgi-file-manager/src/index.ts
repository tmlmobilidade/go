/* * */

import { type MongoClient, MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { LocationManagementDatabase } from './databases/location-management.js';

/* * */

class PCGIFileManagerClass {
	//

	//
	//
	private static _instance: PCGIFileManagerClass;

	//
	// Databases
	public readonly fileManagement: FileManagementDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws Error if required RAW_DB_* environment variables are missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!PCGIFileManagerClass._instance) {
			const mongoClient = await MongoDatabaseClient.getClient({ prefix: 'PCGI_FILE_MANAGER' });
			PCGIFileManagerClass._instance = new PCGIFileManagerClass(mongoClient);
		}
		return PCGIFileManagerClass._instance;
	}

	//
	// Constructor
	private constructor(mongoClient: MongoClient) {
		this.fileManagement = new LocationManagementDatabase(mongoClient);
	}
}

export const pcgiFileManager = asyncSingletonProxy(PCGIFileManagerClass);
