/* * */

import type { AggregateOptions, AggregationCursor, BulkWriteOptions, Collection, Db, DeleteOptions, DeleteResult, Document, Filter, FindOptions, Flatten, InsertManyResult, InsertOneOptions, InsertOneResult, OptionalUnlessRequiredId, UpdateOptions, UpdateResult, WithId } from '@tmlmobilidade/go-clients-mongo';

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type AggregationPipeline, CreateIndexesOptions, isSameIndex, prepareMongoIndexOptions, type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { UnixTimestamp } from '@tmlmobilidade/go-types-shared';
mport { Logger } from '@tmlmobilidade/logger-logger-backend';
import { generateRandomString } from '@tmlmobilidade/strings';
import z from 'zod';

/* * */

export class MongoInterfaceTemplate<T extends Document, TCreate, TUpdate> {
//

	private readonly collection: Collection<T>;
	private readonly collectionName: string;
	private readonly database: Db;
	private readonly indexDescription: false | SimplifiedMongoIndex<T>[];

	//
	private readonly createSchema: null | z.ZodSchema = null;
	private readonly updateSchema: null | z.ZodSchema = null;

	private initPromise: null | Promise<void> = null;

	/**
 * @param collectionName - The name of the collection to create the interface for.
 * @param database - The database to create the interface for.
 * @param createSchema - The schema to use for creating documents.
 * @param indexDescription - The index description to use for the collection.
 */
	public constructor(collectionName: string, database: Db, createSchema: null | z.ZodSchema = null, updateSchema: null | z.ZodSchema = null, indexDescription: false | SimplifiedMongoIndex<T>[] = []) {
		this.collectionName = collectionName;
		this.collection = database.collection<T>(collectionName);
		this.database = database;
		this.createSchema = createSchema;
		this.updateSchema = updateSchema;
		this.indexDescription = indexDescription;
		this.initPromise = this.init().catch((error) => {
			Logger.error({ error, message: `MONGODB [${this.collectionName}]: Error @ constructor(): ${(error as Error).message}` });
			throw error;
		});
	}

	/**
	 * Gets the MongoDB collection instance.
	 * @returns The MongoDB collection instance
	 */
	public async getCollection(): Promise<Collection<T>> {
		return this.collection;
	}

	/**
	 * Finds all distinct values for a key in the collection.
	 * @param key The key to find distinct values for.
	 * @returns A promise that resolves to an array of distinct values for the given key.
	 */
	public async distinct<Key extends keyof WithId<T>>(key: Key, filter: Filter<T> = {}): Promise<Array<Flatten<WithId<T>[Key]>>> {
		return this.collection.distinct(key as string, filter) as Promise<Array<Flatten<WithId<T>[Key]>>>;
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
	 * Finds multiple documents matching the filter criteria with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]> {
		return await this.collection.find(filter ?? {}, options).toArray();
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
	 * Finds a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findOne(filter: Filter<T>, options?: FindOptions): Promise<null | WithId<T>> {
		return await this.collection.findOne(filter, options);
	}

	/**
	 * Inserts multiple documents into the collection.
	 * @param docs - The documents to insert
	 * @param options - The options for the insert operation
	 * @returns A promise that resolves to the result of the insert operation
	 */
	public async insertMany(docs: (TCreate & { _id?: T['_id'], created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], { options, unsafe = false }: { options?: BulkWriteOptions, unsafe?: boolean } = {}): Promise<InsertManyResult<T>> {
		const newDocuments: OptionalUnlessRequiredId<T>[] = [];
		const usedIds = new Set<any>(
			(await this.collection.find(
				{ _id: { $in: docs.map(doc => doc._id).filter(Boolean) as T['_id'][] } } as unknown as Filter<T>,
				{ projection: { _id: 1 } },
			).toArray()).map(doc => doc._id),
		);

		for (const doc of docs) {
			let id = doc._id;
			if (!id || usedIds.has(id)) {
				do {
					id = generateRandomString({ length: 5 }) as T['_id'];
				} while (usedIds.has(id));
			}
			usedIds.add(id);

			newDocuments.push({
				...doc,
				_id: id,
				created_at: doc.created_at || Dates.now('utc').unix_timestamp,
				created_by: doc.created_by || 'system',
				updated_at: doc.updated_at || Dates.now('utc').unix_timestamp,
				updated_by: doc.updated_by || 'system',
			} as unknown as OptionalUnlessRequiredId<T>);
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
		// Setup a copy of the document to be inserted with defaults
		let parsedDocument = {
			...doc,
			created_at: doc.created_at || Dates.now('utc').unix_timestamp,
			created_by: doc.created_by || 'system',
			updated_at: doc.updated_at || Dates.now('utc').unix_timestamp,
			updated_by: doc.updated_by || 'system',
		} as OptionalUnlessRequiredId<T>;

		// Validate the document against the create schema if unsafe is false
		if (!unsafe) {
			try {
				if (!this.createSchema) throw new Error('No schema defined for insert operation. This is either an internal interface error or you should pass unsafe=true to the insert operation.');
				parsedDocument = this.createSchema.parse(parsedDocument);
			} catch (error) {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
			}
		}

		// Preserve a caller-provided _id (create schemas omit it, so parse strips it),
		// otherwise generate a unique one.
		if (doc._id) {
			parsedDocument._id = doc._id;
		} else {
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
	 * Toggle the lock status of a document by its ID.
	 * @param id The ID of the document to toggle lock status.
	 * @param forceValue Optional boolean to explicitly set the lock status.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async toggleLockById(id: T['_id'], forceValue?: boolean): Promise<void> {
		// Get the current document from the database
		const foundDoc = await this.findById(id);
		if (!foundDoc) throw new Error('Document not found');
		// Determine the new lock status
		const newLockStatus = forceValue !== undefined ? forceValue : !foundDoc.is_locked;
		// Update the document with the new lock status
		await this.collection.updateOne({ _id: { $eq: id } }, { $set: { is_locked: newLockStatus } } as unknown as Partial<T>);
	}

	/**
	 * Updates a document by its ID.
	 * @param id The ID of the document to update.
	 * @param updateFields The fields to update in the document.
	 * @param options Optional options for the update operation.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async updateById<TReturnDocument extends boolean = true>(id: T['_id'], updateFields: TUpdate, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>> {
		// If forceIfLocked is not set then check if the document is locked.
		// If it is locked, then throw an error to prevent the operation.
		if (!options?.forceIfLocked) {
			const isLocked = await this.isLockedById(id);
			if (isLocked) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Document is locked and cannot be updated');
		}
		// Perform the update operation
		return this.updateOne({ _id: { $eq: id } }, updateFields, options);
	}

	/**
	 * Updates multiple documents matching the filter criteria.
	 * @param filter - The filter criteria to match documents to update
	 * @param updateFields - The fields to update in the documents
	 * @param options - The options for the update operation
	 * @returns A promise that resolves to the result of the update operation
	 */
	public async updateMany<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: TUpdate & { updated_at?: UnixTimestamp, updated_by?: string }, options?: UpdateOptions & { returnResults?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>> {
		let parsedUpdateFields = {
			...updateFields,
			updated_at: updateFields.updated_at || Dates.now('utc').unix_timestamp,
			updated_by: updateFields.updated_by || 'system',
		};

		if (this.updateSchema) {
			try {
				parsedUpdateFields = this.updateSchema.parse(updateFields);
			} catch (error) {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
			}
		}

		const result = await this.collection.updateMany(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

		if (options?.returnResults === false) return result as TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>;

		if (!result.acknowledged) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update documents', result);
		}

		const updatedDocuments = await this.findMany(filter, options);

		if (!updatedDocuments) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find updated documents', result);
		}

		return updatedDocuments as TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>;
	}

	/**
	 * Updates a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document to update.
	 * @param updateFields The fields to update in the document.
	 * @param options The options for the update operation.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async updateOne<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: TUpdate, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>> {
		// If forceIfLocked is not set then check if the document is locked.
		// If it is locked, then throw an error to prevent the operation.
		if (!options?.forceIfLocked) {
			const isLocked = await this.isLocked(filter);
			if (isLocked) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Document is locked and cannot be updated');
		}
		// Perform the update operation
		let parsedUpdateFields = updateFields;
		if (this.updateSchema) {
			try {
				parsedUpdateFields = this.updateSchema.parse(updateFields);
			} catch (error) {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
			}
		}

		const result = await this.collection.updateOne(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

		if (options?.returnResult === false) return result as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;

		if (!result.acknowledged) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update documents', result);
		}

		const updatedDocument = await this.findOne(filter, options);
		if (!updatedDocument) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find updated document', result);

		return updatedDocument as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;
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
	 * Gets the collection name.
	 * @returns The collection name
	 */
	public getCollectionName(): string {
		return this.collection.collectionName;
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
	}

	private async ensureInitialized() {
		if (!this.initPromise) this.initPromise = this.init();
		await this.initPromise;
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
			if (this.indexDescription === false) return;
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
			// Create indexes (log only when something is actually added)
			for (const idx of indexesToCreate) {
				Logger.info({ message: `MONGODB [${this.collectionName}]: Creating index on keys ${JSON.stringify(idx.key)} with options ${JSON.stringify(prepareMongoIndexOptions(idx))}.` });
				await this.collection.createIndex(idx.key, prepareMongoIndexOptions(idx) as CreateIndexesOptions);
				Logger.success(`MONGODB [${this.collectionName}]: Created index on keys ${JSON.stringify(idx.key)}.`);
			}
		} catch (error) {
			Logger.error({ error, message: `MONGODB [${this.collectionName}]: Error @ syncIndexes(): ${(error as Error).message}` });
			throw error;
		}
	}
}
