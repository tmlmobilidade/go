/* * */

import { ComparableMongoIndex, SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { isSameIndex, normalizeMongoIndex } from '@/utils/mongo/index.js';
import { Logger } from '@tmlmobilidade/logger';
import { type Collection, type Db, type MongoClient } from 'mongodb';

/* * */

export abstract class MongoInterfaceTemplate<T> {
	//

	protected readonly abstract collectionName: string;
	protected readonly abstract databaseName: string;
	protected readonly abstract indexDescription: SimplifiedMongoIndex<T>[];

	private client: MongoClient;
	private collection: Collection<T>;
	private database: Db;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	 */
	protected constructor() {}

	/**
	 * Provides access to the MongoDB client instance,
	 * initializing it if it has not already been created.
	 * @returns A promise that resolves to the MongoDB client instance.
	 * @warning Use with caution: direct access to the client allows for executing arbitrary queries.
	 */
	public async getClient(): Promise<MongoClient> {
		if (!this.client) await this.init();
		return this.client;
	}

	/**
	 * Returns the name of the collection used by this service.
	 */
	async getCollectionName() {
		return this.collectionName;
	}

	/**
	 * Returns the name of the database used by this service.
	 */
	async getDatabaseName() {
		return this.databaseName;
	}

	/**
	 * Abstract method to establish a connection to MongoDB.
	 * This method must be implemented by subclasses to define the specific connection logic,
	 * such as handling SSH tunneling or configuring connection parameters.
	 */
	protected abstract connectToClient(): Promise<MongoClient>;

	/**
	 * Initializes the MongoDB client and ensures that the specified database and collection exist.
	 * This method should be called before performing any operations on the database or collection.
	 * It handles the asynchronous setup process and logs any errors that occur during initialization.
	 * @throws Will throw an error if the client initialization or database/collection setup fails.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	protected async init() {
		// Skip if already initialized
		if (this.client) return;
		// Validate required properties before attempting to connect
		if (!this.databaseName) throw new Error('MONGODB: databaseName is required.');
		if (!this.collectionName) throw new Error('MONGODB: collectionName is required.');
		if (!this.indexDescription) throw new Error('MONGODB: indexDescription is required and cannot be empty.');
		// Connect to the MongoDB client
		this.client = await this.connectToClient();
		this.database = this.client.db(this.databaseName);
		this.collection = this.database.collection(this.collectionName);
		// Ensure the collection indexes are in sync with the provided index description
		await this.syncIndexes();
		// Call postInit for any additional setup logic defined in subclasses
		await this.postInit();
	}

	/**
	 * Optional override for custom setup logic:
	 * indexes, materialized views, constraints, etc.
	 */
	protected async postInit(): Promise<void> {
		// no-op by default
	}

	/**
	 * Ensures that the specified indexes exist in MongoDB, creating them if they do not already exist.
	 * This method performs input validation to prevent unsafe operations and logs the outcome of the operation.
	 * It constructs the necessary index creation queries based on the provided index descriptions and executes them using the client.
	 * @throws Will throw an error if any of the inputs are unsafe or if the index creation query fails.
	 * @returns A promise that resolves when the indexes are ensured to exist.
	 */
	private async syncIndexes(): Promise<void> {
		try {
			// Normalize already applied and new indexes
			// and filter the default _id index.
			const existingIndexes = await this.collection.indexes();
			const normalizedExisting = existingIndexes.map(normalizeMongoIndex<T>);
			const filteredExisting = normalizedExisting.filter(idx => JSON.stringify(idx.key) !== JSON.stringify({ _id: 1 }));
			const normalizedDesired = this.indexDescription.map(idx => normalizeMongoIndex<T>(idx));
			// Setup desired indexes based on indexDescription
			const indexesToDrop: ComparableMongoIndex<T>[] = [];
			const indexesToCreate: Omit<ComparableMongoIndex<T>, 'name'>[] = [];
			// Find indexes to drop
			for (const existingIdx of filteredExisting) {
				// For the list of existing indexes,
				// check if they are present in the desired index description.
				const found = normalizedDesired.some(desiredIdx => isSameIndex(existingIdx, desiredIdx));
				// If not, mark them for dropping.
				if (!found) indexesToDrop.push(existingIdx);
			}
			// Find indexes to create
			for (const desiredIdx of normalizedDesired) {
				// For the list of desired indexes,
				// check if they are present in the existing indexes.
				const found = filteredExisting.some(existingIdx => isSameIndex(existingIdx, desiredIdx));
				// If not, mark them for creation.
				if (!found) indexesToCreate.push(desiredIdx);
			}
			// Drop indexes
			for (const idx of indexesToDrop) {
				if (!idx.name) continue;
				await this.collection.dropIndex(idx.name);
			}
			// Create indexes
			for (const idx of indexesToCreate) {
				await this.collection.createIndex(idx.key, {
					expireAfterSeconds: idx.expireAfterSeconds ?? undefined,
					sparse: idx.sparse,
					unique: idx.unique,
				});
			}
			Logger.info(`MONGODB [${this.collectionName}]: Indexes synchronized.`);
		} catch (error) {
			Logger.error(`MONGODB [${this.collectionName}]: Error @ syncIndexes(): ${(error as Error).message}`);
			throw error;
		}
	}

	//
}
