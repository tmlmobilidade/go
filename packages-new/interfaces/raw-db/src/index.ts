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

	private mongoClient: MongoClient;

	//
	// Databases
	public readonly raw: RawDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @param options Optional Mongo client connection options.
	 * @throws Error if the environment variable for the database URI is missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!RawDBClass._instance) {
			const instance = new RawDBClass();
			await instance.connect();
			RawDBClass._instance = instance;
		}
		return RawDBClass._instance;
	}

	private async connect() {
		// Extract the database URI from environment variables
		const dbUri = process.env.DATABASE_URI;
		if (!dbUri) throw new Error(`Missing DATABASE_URI environment variable`);
		// Attempt to connect to the MonRawDB database
		const mongoClient = await MongoDatabaseClient.getClient({ prefix: 'RAW_DB' });
		// Initialize the MonRawDB connector
		this.mongoClient = mongoClient;
	}

	//
	// Constructor
	private constructor() {
		this.raw = new RawDatabase(this.mongoClient);
	}
}

export const RawDb = asyncSingletonProxy(RawDBClass);
