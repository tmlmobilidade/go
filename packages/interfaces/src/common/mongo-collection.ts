/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { type AggregateOptions, type AggregationCursor, type Collection, type DeleteOptions, type DeleteResult, type Document, type Filter, type FindOptions, Flatten, type IndexDescription, type InsertManyResult, type InsertOneOptions, type InsertOneResult, type MongoClientOptions, type OptionalUnlessRequiredId, type UpdateOptions, type UpdateResult, type WithId } from 'mongodb';
import { z } from 'zod';

/* * */

export abstract class MongoCollectionClass<T extends Document, TCreate, TUpdate> {
	//

	protected createSchema: null | z.ZodSchema = null;
	protected mongoCollection: Collection<T>;
	protected mongoConnector: MongoConnector;
	protected updateSchema: null | z.ZodSchema = null;

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
		const aggregationResult = this.mongoCollection.aggregate(pipeline, options);
		// If returnResult is false, return the cursor directly
		if (options?.returnResult === false) return aggregationResult as AggregationCursor<T>;
		// Otherwise, return the aggregated documents as an array
		return aggregationResult.toArray() as Promise<T[]>;
	}

	/**
	 * Gets all documents in the collection.
	 * @returns A promise that resolves to an array of all documents
	 */
	public async all() {
		return await this.mongoCollection.find().toArray();
	}

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @param options Optional Mongo client connection options.
	 * @throws Error if the environment variable for the database URI is missing or if the connection fails.
	 */
	public async connect(options?: MongoClientOptions) {
		// Extract the database URI from environment variables
		const dbUri = process.env[this.getEnvName()];
		if (!dbUri) throw new Error(`Missing ${this.getEnvName()} environment variable`);
		// Attempt to connect to the MongoDB database
		this.mongoConnector = new MongoConnector(dbUri, options);
		await this.mongoConnector.connect();
		// Initialize the MongoDB collection instance
		this.mongoCollection = this.mongoConnector.client.db('production').collection<T>(this.getCollectionName());
	}

	/**
	 * Counts documents matching the filter criteria.
	 * @param filter The filter criteria to match documents.
	 * @returns A promise that resolves to the count of matching documents.
	 */
	public async count(filter?: Filter<T>): Promise<number> {
		return await this.mongoCollection.countDocuments(filter);
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
		const result = await this.mongoCollection.deleteMany(filter);
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
		const result = await this.mongoCollection.deleteOne(filter, options);
		if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete document', result);
		return result;
	}

	/**
	 * Disconnects from the MongoDB database.
	 */
	public async disconnect() {
		await this.mongoConnector.disconnect();
	}

	/**
	 * Finds all distinct values for a key in the collection.
	 * @param key The key to find distinct values for.
	 * @returns A promise that resolves to an array of distinct values for the given key.
	 */
	public async distinct<Key extends keyof WithId<T>>(key: Key, filter: Filter<T>): Promise<Array<Flatten<WithId<T>[Key]>>>;
	public async distinct<K extends keyof T>(key: K): Promise<T[K][]> {
		return this.mongoCollection.distinct(key as string);
	}

	/**
	 * Checks if a document with the given key and value exists in the collection.
	 * @param key The key to check for existence.
	 * @param value The value of the key to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async exists<K extends keyof T>(key: K, value: T[K]): Promise<boolean> {
		const filter: Filter<T> = { [key]: value } as Filter<T>;
		const doc = await this.mongoCollection.findOne(filter, { projection: { [key]: 1 } });
		return !!doc;
	}

	/**
	 * Checks if a document with the given ID exists in the collection.
	 * @param id The ID of the document to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async existsById(id: T['_id']): Promise<boolean> {
		const foundDoc = await this.mongoCollection.findOne({ _id: id }, { projection: { _id: 1 } });
		return !!foundDoc;
	}

	/**
	 * Finds a document by its ID.
	 * @param id The ID of the document to find.
	 * @param options Optional find options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findById(id: T['_id'], options?: FindOptions): Promise<null | WithId<T>> {
		return this.mongoCollection.findOne({ _id: { $eq: id } }, options);
	}

	/**
	 * Finds multiple documents matching the filter criteria with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]> {
		return await this.mongoCollection.find(filter ?? {}, options).toArray();
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter The filter criteria to match the document.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	public async findOne(filter: Filter<T>, options?: FindOptions): Promise<null | WithId<T>> {
		return await this.mongoCollection.findOne(filter, options);
	}

	/**
	 * Gets the MongoDB collection instance.
	 * @returns The MongoDB collection instance
	 */
	public async getCollection(): Promise<Collection<T>> {
		return this.mongoCollection;
	}

	/**
	 * Gets the MongoDB connector instance.
	 * @returns The MongoDB connector instance
	 */
	public getMongoConnector() {
		return this.mongoConnector;
	}

	/**
	 * Inserts multiple documents into the collection.
	 * @param docs - The documents to insert
	 * @param options - The options for the insert operation
	 * @returns A promise that resolves to the result of the insert operation
	 */
	public async insertMany(docs: (TCreate & { _id?: string, created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], { options, unsafe = false }: { options?: InsertOneOptions, unsafe?: boolean } = {}): Promise<InsertManyResult<T>> {
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
		const foundIds = await this.mongoCollection.find({ _id: { $in: newDocuments.map(doc => doc._id as T['_id']) } } as unknown as Filter<T>, { projection: { _id: 1 } }).toArray();
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

		return await this.mongoCollection.insertMany(parsedDocuments, options);
	}

	/**
	 * Inserts a single document into the collection.
	 * @param doc The document to insert.
	 * @param options The options for the insert operation.
	 * @returns A promise that resolves to the result of the insert operation.
	 */
	public async insertOne<TReturnDocument extends boolean = true>(doc: TCreate & { _id?: string, created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string }, { options, unsafe = false }: { options?: InsertOneOptions & { returnResult?: TReturnDocument }, unsafe?: boolean } = {}): Promise<TReturnDocument extends true ? WithId<T> : InsertOneResult<T>> {
		// Setup a copy of the document to be inserted
		let parsedDocument = { ...doc } as OptionalUnlessRequiredId<T>;
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
		const result = await this.mongoCollection.insertOne(parsedDocument, options);
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
		await this.mongoCollection.updateOne({ _id: { $eq: id } }, { $set: { is_locked: newLockStatus } } as unknown as Partial<T>);
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

		const result = await this.mongoCollection.updateMany(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

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

		const result = await this.mongoCollection.updateOne(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

		if (options?.returnResult === false) return result as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;

		if (!result.acknowledged) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update documents', result);
		}

		const updatedDocument = await this.findOne(filter, options);
		if (!updatedDocument) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find updated document', result);

		return updatedDocument as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;
	}

	// Abstract method for subclasses to provide the MongoDB collection indexes
	protected abstract getCollectionIndexes(): IndexDescription[];

	// Abstract method for subclasses to provide the MongoDB collection name
	protected abstract getCollectionName(): string;

	// Abstract method for subclasses to provide the environment variable name
	protected abstract getEnvName(): string;
}
