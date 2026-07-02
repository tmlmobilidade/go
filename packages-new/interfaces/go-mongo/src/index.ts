/* * */

import { MongoConnector } from '@tmlmobilidade/mongo';
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

	private mongoConnector: MongoConnector;

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
		const mongoConnector = new MongoConnector(dbUri);
		await mongoConnector.connect();

		// Initialize the MongoDB connector
		this.mongoConnector = mongoConnector;
	}

	//
	// Constructor
	private constructor() {
		this.core = new CoreDatabase(this.mongoConnector);
		this.infrastructure = new InfrastructureDatabase(this.mongoConnector);
		this.locations = new LocationsDatabase(this.mongoConnector);
		this.offer = new OfferDatabase(this.mongoConnector);
		this.operation = new OperationDatabase(this.mongoConnector);
	}
}

export const goDB = asyncSingletonProxy(GoDBClass);
