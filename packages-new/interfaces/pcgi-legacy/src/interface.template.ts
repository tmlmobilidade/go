/* * */

import { type Collection, type Db, type Document, type Filter, type FindOptions, type WithId } from '@tmlmobilidade/go-clients-mongo';

/* * */

export class MongoInterfaceTemplate<T extends Document> {
	//

	private readonly collection: Collection<T>;

	/**
	 * @param collectionName The name of the collection to create the interface for.
	 * @param database The database to create the interface for.
	 */
	public constructor(collectionName: string, database: Db) {
		this.collection = database.collection<T>(collectionName);
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
	 * Finds multiple documents matching the filter criteria,
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param options (Optional) find options.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	public async findMany(filter: Filter<T>, options?: FindOptions) {
		return await this.collection.find(filter, options).toArray();
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
	 * Provides access to the MongoDB collection instance,
	 * initializing it if it has not already been created.
	 * @returns A promise that resolves to the MongoDB collection instance.
	 * @warning Use with caution: direct access to the collection allows for executing arbitrary queries.
	 */
	public async getCollection(): Promise<Collection<T>> {
		return this.collection;
	}

	//
}
