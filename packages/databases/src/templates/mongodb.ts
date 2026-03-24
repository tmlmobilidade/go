/* * */

import { ComparableMongoIndex, SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { isSameIndex, normalizeMongoIndex } from '@/utils/mongo/index.js';
import { Logger } from '@tmlmobilidade/logger';
import { type Collection, type Db, type Document, type Filter, type FindOptions, type InsertOneOptions, type InsertOneResult, type MongoClient, type OptionalUnlessRequiredId, type UpdateOptions, type UpdateResult, type WithId } from 'mongodb';
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
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]> {
		return await this.collection.find(filter, options).toArray();
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document.
	 * @param options Optional options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findOne(filter: Filter<T>, options?: FindOptions): Promise<null | WithId<T>> {
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
	async getCollection() {
		if (!this.collection) await this.init();
		return this.collection;
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
	 * Inserts a single document into the collection,
	 * validating it against the create schema.
	 * @param doc The document to insert.
	 * @param options The options for the insert operation.
	 * @returns A promise that resolves to the result of the insert operation.
	 */
	public async insertOne(data: OptionalUnlessRequiredId<TCreate>, options?: InsertOneOptions): Promise<InsertOneResult<T>> {
		// If no create schema is defined, throw an error.
		if (!this.createSchema) throw new Error(`No schema defined for insert operation for ${this.collectionName} collection.`);
		// Validate the document against the create schema
		const parseResult = this.createSchema.safeParse(data);
		if (!parseResult.success) return Promise.reject(new Error(`Document validation failed: ${parseResult.error.message}`));
		// Extract the validated document
		const parsedDocument = parseResult.data as unknown as OptionalUnlessRequiredId<T>;
		// Attempt to insert the document into the collection
		return await this.collection.insertOne(parsedDocument, options);
	}

	/**
	 * Updates a single document in the collection matching the filter criteria,
	 * validating the update data against the update schema.
	 * @param filter The filter criteria to match the document to update.
	 * @param data The update data to apply to the matched document.
	 * @param options The options for the update operation.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async updateOne(filter: Filter<T>, data: TUpdate, options?: UpdateOptions): Promise<UpdateResult<T>> {
		// If no update schema is defined, throw an error.
		if (!this.updateSchema) throw new Error(`No schema defined for update operation for ${this.collectionName} collection.`);
		// Validate the update data against the update schema
		const parseResult = this.updateSchema.safeParse(data);
		if (!parseResult.success) return Promise.reject(new Error(`Update data validation failed: ${parseResult.error.message}`));
		// Extract the validated update data
		const parsedUpdateData = parseResult.data as unknown as Partial<T>;
		// Attempt to find and update the document in the collection
		return await this.collection.updateOne(filter, { $set: parsedUpdateData }, options);
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
