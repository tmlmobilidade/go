/* * */

import { type MongoClient, MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { RawDatabase } from './databases/raw.js';

/* * */

class RawDBClass {
	//

	//
	//
	private static _instance: RawDBClass;

	private readonly mongoClient: MongoClient;

	//
	// Databases
	public readonly raw: RawDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws Error if required RAW_DB_* environment variables are missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!RawDBClass._instance) {
			const mongoClient = await MongoDatabaseClient.getClient({ prefix: 'RAW_DB' });
			RawDBClass._instance = new RawDBClass(mongoClient);
		}
		return RawDBClass._instance;
	}

	//
	// Constructor
	private constructor(mongoClient: MongoClient) {
		this.mongoClient = mongoClient;
		this.raw = new RawDatabase(this.mongoClient);
	}
}

export const RawDb = asyncSingletonProxy(RawDBClass);
