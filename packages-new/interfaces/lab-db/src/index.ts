/* * */

import { ClickHouseClient, ClickHouseDatabaseClient, queryFromFile, queryFromString } from '@tmlmobilidade/go-clients-clickhouse';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { OperationDatabase } from './databases/operation.js';
import { SimplifiedApexDatabase } from './databases/simplified-apex.js';

/* * */

class LabDbClass {
	//

	//
	//
	private static _instance: LabDbClass;

	private clickhouseClient: ClickHouseClient;

	//
	// Databases
	public readonly operation: OperationDatabase;
	public readonly simplifiedApex: SimplifiedApexDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @param options Optional Mongo client connection options.
	 * @throws Error if the environment variable for the database URI is missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!LabDbClass._instance) {
			const instance = new LabDbClass();
			await instance.connect();
			LabDbClass._instance = instance;
		}
		return LabDbClass._instance;
	}

	private async connect() {
		// Extract the database URI from environment variables
		const dbUri = process.env.LAB_DATABASE_URI;
		if (!dbUri) throw new Error(`Missing LAB_DATABASE_URI environment variable`);
		// Attempt to connect to the Lab Database
		const clickhouseClient = await ClickHouseDatabaseClient.getClient({ prefix: 'LAB_DB' });
		// Initialize the ClickHouse connector
		this.clickhouseClient = clickhouseClient;
	}

	//
	// Constructor
	private constructor() {
		this.operation = new OperationDatabase(this.clickhouseClient);
		this.simplifiedApex = new SimplifiedApexDatabase(this.clickhouseClient);
	}
}

export const labDb = asyncSingletonProxy(LabDbClass);
