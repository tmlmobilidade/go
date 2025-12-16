/* * */

import { type AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { type AggregateOptions, type AggregationCursor, type Collection, type DeleteOptions, type DeleteResult, type Document, type Filter, type FindOptions, type IndexDescription, type InsertManyResult, type InsertOneOptions, type InsertOneResult, type MongoClientOptions, type OptionalUnlessRequiredId, type UpdateOptions, type UpdateResult, type WithId } from 'mongodb';
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
		// Attempt to connect to the database
		try {
			// Connect to the MongoDB database
			this.mongoConnector = new MongoConnector(dbUri, options);
			await this.mongoConnector.connect();
			// Setup collection
			this.mongoCollection = this.mongoConnector.client.db('production').collection<T>(this.getCollectionName());
			// Create indexes, if any are defined
			// TODO: This should be refactored as indexes should be created in the database setup script
			if (process.env.NODE_ENV === 'test' && this.getCollectionIndexes().length > 0) {
				await this.mongoCollection.createIndexes(this.getCollectionIndexes());
			}
		}
		catch (error) {
			throw new Error(`Error connecting to ${this.getCollectionName()}`, { cause: error });
		}
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
			if (isLocked) throw new HttpException(HttpStatus.FORBIDDEN, 'Document is locked and cannot be deleted');
		}
		// Perform the delete operation
		const result = await this.deleteOne({ _id: { $eq: id } }, options);
		// Check if the delete operation was acknowledged
		if (!result.acknowledged) throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		// Return the result of the delete operation
		return result;
	}

	/**
	 * Deletes multiple documents matching the filter criteria.
	 * @param filter - The filter criteria to match documents to delete
	 * @returns A promise that resolves to the result of the delete operation
	 */
	public async deleteMany(filter: Filter<T>): Promise<DeleteResult> {
		const result = await this.mongoCollection.deleteMany(filter);
		if (!result.acknowledged) throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		return result;
	}

	/**
	 * Deletes a single document matching the filter criteria.
	 * @param filter - The filter criteria to match the document to delete
	 * @returns A promise that resolves to the result of the delete operation
	 */
	public async deleteOne(filter: Filter<T>, options?: DeleteOptions & { forceIfLocked?: boolean }): Promise<DeleteResult> {
		// If forceIfLocked is not set then check if the document is locked.
		// If it is locked, then throw an error to prevent the operation.
		if (!options?.forceIfLocked) {
			const isLocked = await this.isLocked(filter);
			if (isLocked) throw new HttpException(HttpStatus.FORBIDDEN, 'Document is locked and cannot be deleted');
		}
		// Perform the delete operation
		const result = await this.mongoCollection.deleteOne(filter, options);
		if (!result.acknowledged) throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete document', result);
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
	 * @param key - The key to find distinct values for
	 * @returns A promise that resolves to an array of distinct values for the given key
	 */
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
		return doc !== null;
	}

	/**
	 * Checks if a document with the given ID exists in the collection.
	 * @param id The ID of the document to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async existsById(id: T['_id']): Promise<boolean> {
		const foundDoc = await this.mongoCollection.findOne({ _id: id }, { projection: { _id: 1 } });
		return foundDoc !== null;
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
				}
				catch (error) {
					throw new HttpException(HttpStatus.BAD_REQUEST, error.message, { cause: error });
				}
			}
			parsedDocuments.push(parsedDocument);
		}

		return await this.mongoCollection.insertMany(parsedDocuments, options);
	}

	/**
	 * Inserts a single document into the collection.
	 * @param doc - The document to insert
	 * @param options - The options for the insert operation
	 * @returns A promise that resolves to the result of the insert operation
	 */
	public async insertOne<TReturnDocument extends boolean = true>(
		doc: TCreate & { _id?: string, created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string },
		{ options, unsafe = false }: { options?: InsertOneOptions & { returnResult?: TReturnDocument }, unsafe?: boolean } = {},
	): Promise<TReturnDocument extends true ? WithId<T> : InsertOneResult<T>> {
		const newDocument = {
			...doc,
			_id: doc._id || generateRandomString({ length: 5 }),
			created_at: doc.created_at || Dates.now('utc').unix_timestamp,
			created_by: doc.created_by || 'system',
			updated_at: doc.updated_at || Dates.now('utc').unix_timestamp,
			updated_by: doc.updated_by || 'system',
		} as unknown as OptionalUnlessRequiredId<T>;

		if (!doc._id) {
			while (await this.findById(newDocument._id as T['_id'])) {
				newDocument._id = generateRandomString({ length: 5 }) as T['_id'];
			}
		}

		let parsedDocument = newDocument;
		if (!unsafe) {
			try {
				if (!this.createSchema) {
					throw new Error('No schema defined for insert operation. This is either an internal interface error or you should pass unsafe=true to the insert operation.');
				}
				parsedDocument = this.createSchema.parse(newDocument);
			}
			catch (error) {
				throw new HttpException(HttpStatus.BAD_REQUEST, error.message, { cause: error });
			}
		}

		const result = await this.mongoCollection.insertOne(parsedDocument, options);

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to insert document', result);
		}

		if (options && options.returnResult === false) return result as TReturnDocument extends true ? WithId<T> : InsertOneResult<T>;

		const inserted_doc = await this.findOne({ _id: { $eq: result.insertedId as T['_id'] } }, options);

		if (!inserted_doc) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to find inserted document', result);
		}

		return inserted_doc as TReturnDocument extends true ? WithId<T> : InsertOneResult<T>;
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
		// If the document has a is_locked field and it resolves to a truthy value,
		// then the document is considered locked.
		if (foundDoc?.is_locked) return true;
		// Otherwise, the document is not locked.
		return false;
	}

	/**
	 * Toogle the lock status of a document by its ID.
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
			if (isLocked) throw new HttpException(HttpStatus.FORBIDDEN, 'Document is locked and cannot be updated');
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
			}
			catch (error) {
				throw new HttpException(HttpStatus.BAD_REQUEST, error.message, { cause: error });
			}
		}

		const result = await this.mongoCollection.updateMany(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

		if (options && options.returnResults === false) return result as TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>;

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update documents', result);
		}

		const updated_docs = await this.findMany(filter, options);

		if (!updated_docs) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to find updated documents', result);
		}

		return updated_docs as TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>;
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
			if (isLocked) throw new HttpException(HttpStatus.FORBIDDEN, 'Document is locked and cannot be updated');
		}
		// Perform the update operation
		let parsedUpdateFields = updateFields;
		if (this.updateSchema) {
			try {
				parsedUpdateFields = this.updateSchema.parse(updateFields);
			}
			catch (error) {
				throw new HttpException(HttpStatus.BAD_REQUEST, error.message, { cause: error });
			}
		}

		const result = await this.mongoCollection.updateOne(filter, { $set: { ...parsedUpdateFields, updated_at: Dates.now('utc').unix_timestamp } } as unknown as Partial<T>, options);

		if (options && options.returnResult === false) return result as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update documents', result);
		}

		const updated_doc = await this.findOne(filter, options);
		if (!updated_doc) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to find updated document', result);
		}

		return updated_doc as TReturnDocument extends true ? WithId<T> : UpdateResult<T>;
	}

	// Abstract method for subclasses to provide the MongoDB collection indexes
	protected abstract getCollectionIndexes(): IndexDescription[];

	// Abstract method for subclasses to provide the MongoDB collection name
	protected abstract getCollectionName(): string;

	// Abstract method for subclasses to provide the environment variable name
	protected abstract getEnvName(): string;
}
