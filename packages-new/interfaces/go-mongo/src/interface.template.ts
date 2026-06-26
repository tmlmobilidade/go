/* * */

import type { AggregateOptions, AggregationCursor, AnyBulkWriteOperation, BulkWriteOptions, Collection, Db, DeleteOptions, DeleteResult, Document, Filter, FindOptions, InsertManyResult, InsertOneOptions, InsertOneResult, MongoClient, OptionalUnlessRequiredId, UpdateOptions, WithId } from 'mongodb';

import { AggregationPipeline } from '@/types/mongo/aggregation.js';
import { type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { isSameIndex, prepareMongoIndexOptions } from '@/utils/mongo/index.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { z } from 'zod';

/* * */

export abstract class MongoInterfaceTemplate<T extends Document, TCreate, TUpdate> {
	//

	protected readonly abstract collectionName: string;
	protected readonly abstract databaseName: string;
	protected readonly abstract indexDescription: false | SimplifiedMongoIndex<T>[];

	protected abstract createSchema: z.ZodSchema;
	protected abstract updateSchema: z.ZodSchema;

	private client: MongoClient;
	private collection: Collection<T>;
	private database: Db;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	*/
	protected constructor() {}

	/**
	 * Gets all documents in the collection.
	 * @returns A promise that resolves to an array of all documents
	 */
	public async all() {
		return await this.collection.find().toArray();
	}

	/**
	 * Aggregates documents in the collection.
	 * @param pipeline The aggregation pipeline to execute.
	 * @param options The options for the aggregation operation.
	 * @returns A promise that resolves to an array of aggregated documents.
	 */
	public async aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions & { returnResult?: true }): Promise<T[]>;
	public async aggregate(pipeline: AggregationPipeline<T>, options: AggregateOptions & { returnResult: false }): Promise<AggregationCursor<T>>;
	public async aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions & { returnResult?: boolean }): Promise<AggregationCursor<T> | T[]> {
		// Perform the aggregation pipeline
		const aggregationResult = this.collection.aggregate(pipeline, options);
		// If returnResult is false, return the cursor directly
		if (options?.returnResult === false) return aggregationResult as AggregationCursor<T>;
		// Otherwise, return the aggregated documents as an array
		return aggregationResult.toArray() as Promise<T[]>;
	}

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
	 * Finds a document by its ID.
	 * @param id The ID of the document to find.
	 * @param options Optional find options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findById(id: T['_id'], options?: FindOptions): Promise<null | WithId<T>> {
		return this.collection.findOne({ _id: { $eq: id } }, options);
	}

	/**
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions) {
		return await this.collection.find(filter ?? {}, options).toArray();
	}

	/**
	 * Checks if a document with the given key and value exists in the collection.
	 * @param key The key to check for existence.
	 * @param value The value of the key to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async exists<K extends keyof T>(key: K, value: T[K]): Promise<boolean> {
		const filter: Filter<T> = { [key]: value } as Filter<T>;
		const doc = await this.collection.findOne(filter, { projection: { [key]: 1 } });
		return !!doc;
	}

	/**
	 * Checks if a document with the given ID exists in the collection.
	 * @param id The ID of the document to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async existsById(id: T['_id']): Promise<boolean> {
		const foundDoc = await this.collection.findOne({ _id: id }, { projection: { _id: 1 } });
		return !!foundDoc;
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
	 * initializing it if it has not already been created.x
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
	 * Deletes a single document by its ID.
	 * @param id The ID of the document to delete.
	 * @returns A promise that resolves to the result of the delete operation.
	 */
	public async deleteById(id: T['_id'], options?: DeleteOptions & { forceIfLocked?: boolean }): Promise<DeleteResult> {
		// If forceIfLocked is not set then check if the document is locked.
		// If it is locked, then throw an error to prevent the operation.
		if (!options?.forceIfLocked) {
			const isLocked = await this.isLockedById(id);
			if (isLocked) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Document is locked and cannot be deleted');
		}
		// Perform the delete operation
		const result = await this.deleteOne({ _id: { $eq: id } }, options);
		// Check if the delete operation was acknowledged
		if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		// Return the result of the delete operation
		return result;
	}

	/**
	 * Deletes a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document to delete.
	 * @returns A promise that resolves to the result of the delete operation.
	 */
	public async deleteOne(filter: Filter<T>, options?: DeleteOptions & { forceIfLocked?: boolean }): Promise<DeleteResult> {
		// If forceIfLocked is not set then check if the document is locked.
		// If it is locked, then throw an error to prevent the operation.
		if (!options?.forceIfLocked) {
			const isLocked = await this.isLocked(filter);
			if (isLocked) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Document is locked and cannot be deleted');
		}
		// Perform the delete operation
		const result = await this.collection.deleteOne(filter, options);
		if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete document', result);
		return result;
	}

	/**
	 * Checks if a document with the given ID is locked or not.
	 * @param id The ID of the document to check.
	 * @returns A promise that resolves to the result of the check operation.
	 */
	public async isLocked(filter: Filter<T>): Promise<boolean> {
		// Fetch the document by its ID from the database
		const foundDoc = await this.findOne(filter);
		// If the document has a is_locked field and it resolves to a truthy value,
		// then the document is considered locked.
		if (foundDoc?.is_locked) return true;
		// Otherwise, the document is not locked.
		return false;
	}

	/**
	 * Checks if a document with the given ID is locked or not.
	 * @param id The ID of the document to check.
	 * @returns A promise that resolves to the result of the check operation.
	 */
	public async isLockedById(id: T['_id']): Promise<boolean> {
		// Fetch the document by its ID from the database
		const foundDoc = await this.findById(id);
		// If the document has an is_locked field and it resolves
		// to a truthy value, then the document is considered locked.
		if (foundDoc?.is_locked) return true;
		// Otherwise, the document is not locked.
		return false;
	}

	/**
	 * Deletes multiple documents matching the filter criteria.
	 * @param filter The filter criteria to match documents to delete.
	 * @returns A promise that resolves to the result of the delete many operation.
	 */
	public async deleteMany(filter: Filter<T>): Promise<DeleteResult> {
		const result = await this.collection.deleteMany(filter);
		if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		return result;
	}

	/**
	 * Inserts multiple documents into the collection.
	 * @param docs - The documents to insert
	 * @param options - The options for the insert operation
	 * @returns A promise that resolves to the result of the insert operation
	 */
	public async insertMany(docs: (TCreate & { _id?: T['_id'], created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], { options, unsafe = false }: { options?: InsertOneOptions, unsafe?: boolean } = {}): Promise<InsertManyResult<T>> {
		const newDocuments = docs.map((doc) => {
			return {
				...doc,
				_id: doc._id || generateRandomString({ length: 5 }),
				created_at: doc.created_at || Dates.now('utc').unix_timestamp,
				created_by: doc.created_by || 'system',
				updated_at: doc.updated_at || Dates.now('utc').unix_timestamp,
				updated_by: doc.updated_by || 'system',
			} as unknown as OptionalUnlessRequiredId<T>;
		});

		// Ensure all documents have a unique ID
		const foundIds = await this.collection.find({ _id: { $in: newDocuments.map(doc => doc._id as T['_id']) } } as unknown as Filter<T>, { projection: { _id: 1 } }).toArray();
		for (const newDocument of newDocuments) {
			if (foundIds.find(id => id._id === newDocument._id)) {
				newDocument._id = generateRandomString({ length: 5 }) as T['_id'];
			}
		}

		const parsedDocuments: OptionalUnlessRequiredId<T>[] = [];
		for (const newDocument of newDocuments) {
			let parsedDocument = newDocument;
			if (!unsafe) {
				try {
					if (!this.createSchema) {
						throw new Error('No schema defined for insert operation. This is either an internal interface error or you should pass unsafe=true to the insert operation.');
					}
					parsedDocument = this.createSchema.parse(newDocument) as OptionalUnlessRequiredId<T>;
				} catch (error) {
					throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
				}
			}
			parsedDocuments.push(parsedDocument);
		}

		return await this.collection.insertMany(parsedDocuments, options);
	}

	/**
	 * Inserts a single document into the collection.
	 * @param doc The document to insert.
	 * @param options The options for the insert operation.
	 * @returns A promise that resolves to the result of the insert operation.
	 */
	public async insertOne<TReturnDocument extends boolean = true>(doc: TCreate & { _id?: T['_id'], created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string }, { options, unsafe = false }: { options?: InsertOneOptions & { returnResult?: TReturnDocument }, unsafe?: boolean } = {}): Promise<TReturnDocument extends true ? WithId<T> : InsertOneResult<T>> {
		// Setup a copy of the document to be inserted
		let parsedDocument = { ...doc } as OptionalUnlessRequiredId<T & { created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string }>;
		// Validate the document against the create schema if unsafe is false
		if (!unsafe) {
			try {
				// If no create schema is defined, throw an error.
				// In safe mode, a schema is required to validate the document.
				if (!this.createSchema) throw new Error('No schema defined for insert operation. This is either an internal interface error or you should pass unsafe=true to the insert operation.');
				// Validate the document against the create schema
				parsedDocument = this.createSchema.parse(parsedDocument);
				// Add the missing default fields, if present in the original document.
				// The schema might have omitted these fields, so we need to add them back.
				if (doc._id) parsedDocument._id = doc._id;
				if (doc.created_at) parsedDocument.created_at = doc.created_at;
				if (doc.created_by) parsedDocument.created_by = doc.created_by;
				if (doc.updated_at) parsedDocument.updated_at = doc.updated_at;
				if (doc.updated_by) parsedDocument.updated_by = doc.updated_by;
			} catch (error) {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
			}
		}
		// Add default fields if they are missing from the original document
		if (!doc.created_at) parsedDocument.created_at = Dates.now('utc').unix_timestamp;
		if (!doc.created_by) parsedDocument.created_by = 'system';
		if (!doc.updated_at) parsedDocument.updated_at = Dates.now('utc').unix_timestamp;
		if (!doc.updated_by) parsedDocument.updated_by = 'system';
		// Add the ID if it is missing from the original document
		// If the document is missing any default fields, add them
		if (!doc._id) {
			parsedDocument._id = generateRandomString({ length: 5 }) as T['_id'];
			while (await this.findById(parsedDocument._id as T['_id'])) {
				parsedDocument._id = generateRandomString({ length: 5 }) as T['_id'];
			}
		}
		// Attempt to insert the document into the collection
		const result = await this.collection.insertOne(parsedDocument, options);
		// Check if the insert operation was acknowledged
		if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to insert document', result);
		// If returnResult is false, return the insert result directly
		if (options?.returnResult === false) return result as TReturnDocument extends true ? WithId<T> : InsertOneResult<T>;
		// Otherwise, fetch and return the inserted document
		const insertedDoc = await this.findOne({ _id: { $eq: result.insertedId as T['_id'] } }, options);
		if (!insertedDoc) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find inserted document', result);
		return insertedDoc as TReturnDocument extends true ? WithId<T> : InsertOneResult<T>;
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
				await this.collection.createIndex(idx.key, prepareMongoIndexOptions(idx));
				Logger.success(`MONGODB [${this.collectionName}]: Created index on keys ${JSON.stringify(idx.key)}.`);
			}
			Logger.success(`MONGODB [${this.collectionName}]: Indexes synchronized.`);
		} catch (error) {
			Logger.error({ error, message: `MONGODB [${this.collectionName}]: Error @ syncIndexes(): ${(error as Error).message}` });
			throw error;
		}
	}

	//
}
