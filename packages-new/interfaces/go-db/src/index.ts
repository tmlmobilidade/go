/* * */

import { type MongoClient, MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { CoreDatabase } from './databases/core.js';
import { InfrastructureDatabase } from './databases/infrastructure.js';
import { LocationsDatabase } from './databases/locations.js';
import { OfferDatabase } from './databases/offer.js';
import { OperationDatabase } from './databases/operation.js';

/* * */

class GoDBClass {
	//

	//
	//
	private static _instance: GoDBClass;

	private mongoClient: MongoClient;

	//
	// Databases
	public readonly core: CoreDatabase;
	public readonly infrastructure: InfrastructureDatabase;
	public readonly locations: LocationsDatabase;
	public readonly offer: OfferDatabase;
	public readonly operation: OperationDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @param options Optional Mongo client connection options.
	 * @throws Error if the environment variable for the database URI is missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!GoDBClass._instance) {
			const instance = new GoDBClass();
			await instance.connect();
			GoDBClass._instance = instance;
		}
		return GoDBClass._instance;
	}

	private async connect() {
		// Extract the database URI from environment variables
		const dbUri = process.env.DATABASE_URI;
		if (!dbUri) throw new Error(`Missing DATABASE_URI environment variable`);
		// Attempt to connect to the MongoDB database
		const mongoClient = await MongoDatabaseClient.getClient({ prefix: 'GODB' });
		// Initialize the MongoDB connector
		this.mongoClient = mongoClient;
	}

	//
	// Constructor
	private constructor() {
		this.core = new CoreDatabase(this.mongoClient);
		this.infrastructure = new InfrastructureDatabase(this.mongoClient);
		this.locations = new LocationsDatabase(this.mongoClient);
		this.offer = new OfferDatabase(this.mongoClient);
		this.operation = new OperationDatabase(this.mongoClient);
	}
}

export const goDB = asyncSingletonProxy(GoDBClass);
