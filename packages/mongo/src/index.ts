/* * */

import { type Collection, type Db, type DbOptions, type Document, MongoClient, type MongoClientOptions } from 'mongodb';

/* * */

export class MongoConnector {
	/**
	 * Get the MongoClient instance.
	 */
	get client(): MongoClient {
		return this._client;
	}

	private _client: MongoClient;

	constructor(uri: string, options?: MongoClientOptions) {
		this._client = new MongoClient(uri, options);

		this._client.on('close', () => {
			console.warn('MongoDB connection closed unexpectedly.');
		});
		this._client.on('reconnect', () => {
			console.log('MongoDB reconnected.');
		});
	}

	/**
	 * Aggregates data from a collection.
	 */
	async aggregate<T extends Document>(collection: Collection<T>, pipeline: Document[]) {
		return collection.aggregate(pipeline).toArray();
	}

	/**
     * Connect to MongoDB and return the database instance.
     */
	async connect(): Promise<MongoClient> {
		if (!this._client) {
			throw new Error('MongoClient not initialized');
		}

		try {
			await this._client.connect();
			return this._client;
		} catch (error) {
			throw new Error('Error connecting to MongoDB', { cause: error });
		}
	}

	/**
     * Create a new Db instance sharing the current socket connections.
     *
     * @param dbName - The name of the database we want to use. If not provided, use database name from connection string.
     * @param options - Optional settings for Db construction
     */
	db(dbName?: string, options?: DbOptions): Db {
		return this._client.db(dbName, options);
	}

	/**
   * Close the MongoDB connection.
   */
	async disconnect(): Promise<void> {
		if (this._client) {
			await this._client.close();
			console.log('⤷ Disconnected from MongoDB.');
		}
	}

	/**
     * Get a specific collection by name.
     * @param db - The database instance.
     * @param collectionName - The name of the collection to retrieve.
     * @returns The collection instance.
     */
	async getCollection<T extends Document>(db: Db, collectionName: string): Promise<Collection<T>> {
		return db.collection<T>(collectionName);
	}

	/**
	 * Watches a collection for changes.
	 */
	async watch<T extends Document>(collection: Collection<T>) {
		return collection.watch();
	}
}
