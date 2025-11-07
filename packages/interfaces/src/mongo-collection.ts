/* * */

import { AggregationPipeline } from '@/aggregation-pipeline.js';
import { MongoConnector } from '@tmlmobilidade/connectors-mongo';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { AggregateOptions, AggregationCursor, Collection, DeleteOptions, DeleteResult, Document, Filter, FindOptions, IndexDescription, InsertManyResult, InsertOneOptions, InsertOneResult, MongoClientOptions, OptionalUnlessRequiredId, UpdateOptions, UpdateResult, WithId } from 'mongodb';
import { z } from 'zod';

/* * */

export abstract class MongoCollectionClass<T extends Document, TCreate, TUpdate> {
	protected createSchema: null | z.ZodSchema = null;
	protected mongoCollection: Collection<T>;
	protected mongoConnector: MongoConnector;
	protected updateSchema: null | z.ZodSchema = null;

	/**
	 * Aggregates documents in the collection.
	 * @param pipeline - The aggregation pipeline to execute
	 * @param options - The options for the aggregation operation
	 * @returns A promise that resolves to an array of aggregated documents
	 */
	public async aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions & { returnResult?: true }): Promise<T[]>;
	public async aggregate(pipeline: AggregationPipeline<T>, options: AggregateOptions & { returnResult: false }): Promise<AggregationCursor<T>>;
	public async aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions & { returnResult?: boolean }): Promise<AggregationCursor<T> | T[]> {
		const aggregation = this.mongoCollection.aggregate(pipeline, options);

		if (options?.returnResult === false) {
			return aggregation as AggregationCursor<T>;
		}

		return aggregation.toArray() as Promise<T[]>;
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
	 * @param options Optional Mongo client connection options
	 * @throws {Error} If connection fails
	 */
	public async connect(options?: MongoClientOptions) {
		//

		const dbUri = process.env[this.getEnvName()];

		if (!dbUri) {
			throw new Error(`Missing ${this.getEnvName()} environment variable`);
		}

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
	 * @param filter - The filter criteria to match documents
	 * @returns A promise that resolves to the count of matching documents
	 */
	public async count(filter?: Filter<T>): Promise<number> {
		return await this.mongoCollection.countDocuments(filter);
	}

	/**
	 * Deletes a single document by its ID.
	 * @param id - The ID of the document to delete
	 * @returns A promise that resolves to the result of the delete operation
	 */
	public async deleteById(id: string, options?: DeleteOptions): Promise<DeleteResult> {
		const result = await this.deleteOne({ _id: { $eq: id } } as unknown as Filter<T>, options);

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		}

		return result;
	}

	/**
	 * Deletes multiple documents matching the filter criteria.
	 * @param filter - The filter criteria to match documents to delete
	 * @returns A promise that resolves to the result of the delete operation
	 */
	public async deleteMany(filter: Filter<T>): Promise<DeleteResult> {
		const result = await this.mongoCollection.deleteMany(filter);

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete documents', result);
		}

		return result;
	}

	/**
	 * Deletes a single document matching the filter criteria.
	 * @param filter - The filter criteria to match the document to delete
	 * @returns A promise that resolves to the result of the delete operation
	 */
	public async deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
		const result = await this.mongoCollection.deleteOne(filter, options);

		if (!result.acknowledged) {
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete document', result);
		}

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
	 * @param _id The ID of the document to check for existence.
	 * @returns A promise that resolves to true if the document exists, false otherwise.
	 */
	public async existsById(_id: T['_id']): Promise<boolean> {
		const doc = await this.mongoCollection.findOne({ _id: _id }, { projection: { _id: 1 } });
		return doc !== null;
	}

	/**
	 * Finds a document by its ID.
	 * @param _id The ID of the document to find.
	 * @param options Optional find options.
	 * @returns A promise that resolves to the matching document or null if not found
	 */
	public async findById(_id: T['_id'], options?: FindOptions): Promise<null | WithId<T>> {
		const filter: Filter<T> = { _id: { $eq: _id } } as Filter<T>;
		return this.mongoCollection.findOne(filter, options);
	}

	/**
	 * Finds multiple documents matching the filter criteria with optional pagination and sorting.
	 * @param filter - (Optional) filter criteria to match documents
	 * @param options - (Optional) find options
	 * @returns A promise that resolves to an array of matching documents
	 */
	public async findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]> {
		return await this.mongoCollection.find(filter ?? {}, options).toArray();
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter - The filter criteria to match the document
	 * @param options - (Optional) find options
	 * @returns A promise that resolves to the matching document or null if not found
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
	 * Updates a document by its ID.
	 * @param _id The ID of the document to update.
	 * @param updateFields The fields to update in the document.
	 * @param options Optional options for the update operation.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async updateById<TReturnDocument extends boolean = true>(_id: T['_id'], updateFields: TUpdate, options?: UpdateOptions & { returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>> {
		const filter: Filter<T> = { _id: { $eq: _id } } as Filter<T>;
		return this.updateOne(filter, updateFields, options);
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
	 * @param filter - The filter criteria to match the document to update
	 * @param updateFields - The fields to update in the document
	 * @param options - The options for the update operation
	 * @returns A promise that resolves to the result of the update operation
	 */
	public async updateOne<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: TUpdate, options?: UpdateOptions & { returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>> {
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
