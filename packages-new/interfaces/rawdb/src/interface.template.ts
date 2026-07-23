/* * */

import { AnyBulkWriteOperation, BulkWriteOptions, BulkWriteResult, Collection, CreateIndexesOptions, Db, Document, Filter, FindOptions, InsertOneOptions, isSameIndex, prepareMongoIndexOptions, SimplifiedMongoIndex, WithId } from '@tmlmobilidade/go-clients-mongo';
import { Logger } from '@tmlmobilidade/logger';
import { z } from 'zod';

/* * */

export class MongoInterfaceTemplate<T extends Document, TCreate> {
	//

	private readonly collectionName: string;
	private readonly createSchema: z.ZodSchema;
	private readonly database: Db;
	private readonly indexDescription: false | SimplifiedMongoIndex<T>[];

	//
	private readonly collection: Collection<T>;

	private initPromise: null | Promise<void> = null;

	/**
	 * @param collectionName - The name of the collection to create the interface for.
	 * @param database - The database to create the interface for.
	 * @param createSchema - The schema to use for creating documents.
	 * @param indexDescription - The index description to use for the collection.
	 */
	public constructor(collectionName: string, database: Db, createSchema: z.ZodSchema, indexDescription: false | SimplifiedMongoIndex<T>[] = []) {
		this.collectionName = collectionName;
		this.collection = database.collection<T>(collectionName);
		this.database = database;
		this.createSchema = createSchema;
		this.indexDescription = indexDescription;
		this.initPromise = this.init().catch((error) => {
			Logger.error({ error, message: `MONGODB [${this.collectionName}]: Error @ constructor(): ${(error as Error).message}` });
			throw error;
		});
	}

	/**
	 * Counts documents matching the filter criteria.
	 * @param filter The filter criteria to match documents.
	 * @returns A promise that resolves to the count of matching documents.
	 */
	public async count(filter?: Filter<T>): Promise<number> {
		await this.ensureInitialized();
		return await this.collection.countDocuments(filter);
	}

	/**
	 * Finds all distinct values for a key in the collection.
	 * @param key The key to find distinct values for.
	 * @param filter Optional filter criteria to match documents before extracting distinct values.
	 * @returns A promise that resolves to an array of distinct values for the given key.
	 */
	public async distinct<Key extends keyof WithId<T>>(key: Key, filter: Filter<T>) {
		await this.ensureInitialized();
		return this.collection.distinct(key, filter);
	}

	/**
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter: Filter<T>, options?: FindOptions) {
		await this.ensureInitialized();
		return await this.collection.find(filter, options).toArray();
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document.
	 * @param options Optional options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findOne(filter: Filter<T>, options?: FindOptions) {
		await this.ensureInitialized();
		return await this.collection.findOne(filter, options);
	}

	/**
	 * Provides access to the MongoDB collection instance,
	 * initializing it if it has not already been created.
	 * @returns A promise that resolves to the MongoDB collection instance.
	 * @warning Use with caution: direct access to the collection allows for executing arbitrary queries.
	 */
	public async getCollection(): Promise<Collection<T>> {
		await this.ensureInitialized();
		return this.collection;
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
	public async bulkWrite(operations: AnyBulkWriteOperation<T>[], options?: BulkWriteOptions): Promise<BulkWriteResult> {
		await this.ensureInitialized();
		return await this.collection.bulkWrite(operations, options);
	}

	/**
	 * Inserts multiple documents into the collection after validating them against the create schema.
	 * @param data An array of documents to insert, conforming to the TCreate type.
	 * @param options Optional insert options to configure the behavior of the insert operation.
	 * @returns A promise that resolves to the result of the insertMany operation.
	 */
	public async insertMany(data: TCreate[], options?: BulkWriteOptions) {
		await this.ensureInitialized();
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
		await this.ensureInitialized();
		// If no create schema is defined, throw an error.
		if (!this.createSchema) throw new Error(`No schema defined for insert operation for ${this.collectionName} collection.`);
		// Validate the document against the create schema
		const parseResult = this.createSchema.safeParse(data);
		if (!parseResult.success) throw new Error(`Document validation failed: ${parseResult.error.message}`);
		// Attempt to insert the document into the collection
		return await this.collection.insertOne(parseResult.data, options);
	}

	/**
	 * Initializes the MongoDB client and ensures that the specified database and collection exist.
	 * This method should be called before performing any operations on the database or collection.
	 * It handles the asynchronous setup process and logs any errors that occur during initialization.
	 * @throws Will throw an error if the client initialization or database/collection setup fails.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	protected async init() {
		// Ensure the collection exists and its indexes are in sync
		// with the provided index description.
		await this.createCollectionIfNotExists();
		await this.syncIndexes();
		// Call postInit for any additional setup logic defined in subclasses
		await this.postInit();
	}

	private async ensureInitialized() {
		if (!this.initPromise) this.initPromise = this.init();
		await this.initPromise;
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
		Logger.info({ message: `MONGODB [${this.collectionName}]: Collection created.` });
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
			if (this.indexDescription === false) {
				Logger.info({ message: `MONGODB [${this.collectionName}]: Skipping index synchronization.` });
				return;
			}
			// Start index synchronization process
			Logger.info({ message: `MONGODB [${this.collectionName}]: Synchronizing indexes...` });
			// Normalize already applied and new indexes
			// and filter the default _id index.
			const existingIndexes = await this.collection.indexes();
			const filteredExisting = existingIndexes.filter(idx => JSON.stringify(idx.key) !== JSON.stringify({ _id: 1 }));
			// Setup desired indexes based on indexDescription
			const indexesToCreate: SimplifiedMongoIndex<T>[] = [];
			// Find indexes to create
			for (const desiredIdx of this.indexDescription) {
				// For the list of desired indexes,
				// check if they are present in the existing indexes.
				const found = filteredExisting.some(existingIdx => isSameIndex(existingIdx, desiredIdx));
				// If not, mark them for creation.
				if (!found) indexesToCreate.push(desiredIdx);
			}
			// Create indexes
			for (const idx of indexesToCreate) {
				Logger.info({ message: `MONGODB [${this.collectionName}]: Creating index on keys ${JSON.stringify(idx.key)} with options ${JSON.stringify(prepareMongoIndexOptions(idx))}.` });
				await this.collection.createIndex(idx.key, prepareMongoIndexOptions(idx) as CreateIndexesOptions);
				Logger.success(`MONGODB [${this.collectionName}]: Created index on keys ${JSON.stringify(idx.key)}.`);
			}
			Logger.success(`MONGODB [${this.collectionName}]: Indexes synchronized.`);
		} catch (error) {
			Logger.error({ error, message: `MONGODB [${this.collectionName}]: Error @ syncIndexes(): ${(error as Error).message}` });
			throw error;
		}
	}

	/**
	 * Gets the collection name.
	 * @returns The collection name
	 */
	public getCollectionName(): string {
		return this.collectionName;
	}
}
