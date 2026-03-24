/* * */

import type {
	AnyBulkWriteOperation,
	BulkWriteOptions,
	ChangeStreamOptions,
	Collection,
	Db,
	Document,
	Filter,
	FindOptions,
	InsertOneOptions,
	MongoClient,
	UpdateOptions,
	WithId,
} from 'mongodb';

import { type ComparableMongoIndex, type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { isSameIndex, normalizeMongoIndex } from '@/utils/mongo/index.js';
import { Logger } from '@tmlmobilidade/logger';
import { z } from 'zod';

/* * */

export abstract class MongoInterfaceTemplate<T extends Document, TCreate, TUpdate> {
	//

	protected readonly abstract collectionName: string;
	protected readonly abstract databaseName: string;
	protected readonly abstract indexDescription: SimplifiedMongoIndex<T>[];

	protected abstract createSchema: null | z.ZodSchema;
	protected abstract updateSchema: null | z.ZodSchema;

	private client: MongoClient;
	private collection: Collection<T>;
	private database: Db;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	*/
	protected constructor() {}

	/**
	 * Counts documents matching the filter criteria.
	 * @param filter The filter criteria to match documents.
	 * @returns A promise that resolves to the count of matching documents.
	 */
	public async count(filter?: Filter<T>): Promise<number> {
		return await this.collection.countDocuments(filter);
	}

	/**
	 * Finds all distinct values for a key in the collection.
	 * @param key The key to find distinct values for.
	 * @param filter Optional filter criteria to match documents before extracting distinct values.
	 * @returns A promise that resolves to an array of distinct values for the given key.
	 */
	public async distinct<Key extends keyof WithId<T>>(key: Key, filter: Filter<T>) {
		return this.collection.distinct(key, filter);
	}

	/**
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions) {
		return await this.collection.find(filter, options).toArray();
	}

	/**
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting, and returns a cursor for streaming results.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to a cursor for streaming matching documents.
	 */
	public stream(filter?: Filter<T>, options?: FindOptions) {
		return this.collection.find(filter, options).stream();
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document.
	 * @param options Optional options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findOne(filter: Filter<T>, options?: FindOptions) {
		return await this.collection.findOne(filter, options);
	}

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
	 * Provides access to the MongoDB collection instance,
	 * initializing it if it has not already been created.
	 * @returns A promise that resolves to the MongoDB collection instance.
	 * @warning Use with caution: direct access to the collection allows for executing arbitrary queries.
	 */
	public async getCollection(): Promise<Collection<T>> {
		if (!this.collection) await this.init();
		return this.collection;
	}

	/**
	 * Returns the name of the collection used by this service.
	 */
	public async getCollectionName(): Promise<string> {
		return this.collectionName;
	}

	/**
	 * Returns the name of the database used by this service.
	 */
	public async getDatabaseName(): Promise<string> {
		return this.databaseName;
	}

	/**
	 * This method allows for performing multiple write operations
	 * in a single request, which can improve performance.
	 * The operations can include inserts, updates, deletes, and replacements.
	 * @param operations An array of bulk write operations to execute on the collection.
	 * @param options The options for the bulk write operation.
	 * @returns A promise that resolves to the result of the bulk write operation.
	 * @warning This method does not perform schema validation on the operations.
	 * It is the responsibility of the caller to ensure that the operations are valid and conform to the expected schemas.
	 */
	public async bulkWrite(operations: AnyBulkWriteOperation<T>[], options?: BulkWriteOptions) {
		return await this.collection.bulkWrite(operations, options);
	}

	/**
	 * Watches for changes in the MongoDB collection and returns a change stream cursor.
	 * @param pipeline (Optional) An array of aggregation pipeline stages to filter the change events.
	 * @param options (Optional) Change stream options to configure the behavior of the change stream.
	 * @returns A change stream cursor that can be used to iterate over the change events.
	 */
	public watch(pipeline?: Document[], options?: ChangeStreamOptions) {
		return this.collection.watch(pipeline, options);
	}

	/**
	 * Inserts multiple documents into the collection after validating them against the create schema.
	 * @param data An array of documents to insert, conforming to the TCreate type.
	 * @param options Optional insert options to configure the behavior of the insert operation.
	 * @returns A promise that resolves to the result of the insertMany operation.
	 */
	public async insertMany(data: TCreate[], options?: InsertOneOptions) {
		// If no create schema is defined, throw an error.
		if (!this.createSchema) throw new Error(`No schema defined for insert operation for ${this.collectionName} collection.`);
		// Validate each document against the create schema
		const parsedDocuments = data.map((doc) => {
			const parseResult = this.createSchema.safeParse(doc);
			if (!parseResult.success) throw new Error(`Document validation failed: ${parseResult.error.message}`);
			return parseResult.data;
		});
		// Attempt to insert the documents into the collection
		return await this.collection.insertMany(parsedDocuments, options);
	}

	public async insertOne(data: TCreate, options?: InsertOneOptions) {
		// If no create schema is defined, throw an error.
		if (!this.createSchema) throw new Error(`No schema defined for insert operation for ${this.collectionName} collection.`);
		// Validate the document against the create schema
		const parseResult = this.createSchema.safeParse(data);
		if (!parseResult.success) throw new Error(`Document validation failed: ${parseResult.error.message}`);
		// Attempt to insert the document into the collection
		return await this.collection.insertOne(parseResult.data, options);
	}

	public async updateOne(filter: Filter<T>, data: TUpdate, options?: UpdateOptions) {
		// If no update schema is defined, throw an error.
		if (!this.updateSchema) throw new Error(`No schema defined for update operation for ${this.collectionName} collection.`);
		// Validate the update data against the update schema
		const parseResult = this.updateSchema.safeParse(data);
		if (!parseResult.success) throw new Error(`Update data validation failed: ${parseResult.error.message}`);
		// Attempt to find and update the document in the collection
		return await this.collection.updateOne(filter, { $set: parseResult.data }, options);
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
		// Ensure the collection exists and its indexes are in sync
		// with the provided index description.
		await this.createCollectionIfNotExists();
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
	 * Ensures that the specified collection exists in the MongoDB database,
	 * creating it if it does not already exist.
	 * @returns A promise that resolves when the collection is ensured to exist.
	 */
	private async createCollectionIfNotExists(): Promise<void> {
		const collections = await this.database.listCollections({ name: this.collectionName }).toArray();
		if (collections.length) return;
		await this.database.createCollection(this.collectionName);
		Logger.info(`MONGODB [${this.collectionName}]: Collection created.`);
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
