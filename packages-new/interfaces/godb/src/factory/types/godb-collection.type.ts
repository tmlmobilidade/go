/* * */

import type { AggregateOptions, AggregationCursor, AggregationPipeline, ClientSession, Collection, DeleteResult, Document, Filter } from '@tmlmobilidade/go-clients-mongo';

import { type InsertableDocument } from './insertable-document.type.js';
import { type UpdatableDocument } from './updatable-document.type.js';

/**
 * The GoDB collection interface type.
 */
export interface GoDbCollection<T extends Document> {

	aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<T[]>

	aggregateCursor(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<AggregationCursor<T>>

	// count(filter?: Filter<T>): Promise<number>

	deleteById(_id: string, clientSession?: ClientSession): Promise<DeleteResult>

	deleteMany(filter: Filter<T>, clientSession?: ClientSession): Promise<DeleteResult>

	deleteOne(filter: Filter<T>, clientSession?: ClientSession): Promise<DeleteResult>

	// distinct<Key extends keyof WithId<T>>(key: Key, filter?: Filter<T>): Promise<Array<Flatten<WithId<T>[Key]>>>

	// exists<K extends keyof T>(key: K, value: T[K]): Promise<boolean>

	// existsById(id: string): Promise<boolean>

	findById(_id: string, clientSession?: ClientSession): Promise<null | T>

	findMany(filter?: Filter<T>, clientSession?: ClientSession): Promise<T[]>

	findOne(filter: Filter<T>, clientSession?: ClientSession): Promise<null | T>

	getCollection(): Promise<Collection<T>>

	// getCollectionName(): string

	// insertMany(docs: (T & { _id?: string, created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], options?: { options?: BulkWriteOptions, unsafe?: boolean }): Promise<InsertManyResult<T>>

	insertOne(doc: InsertableDocument<T>, clientSession?: ClientSession): Promise<T>

	insertOneUnsafe(doc: T, clientSession?: ClientSession): Promise<T>

	// isLocked(filter: Filter<T>): Promise<boolean>

	// isLockedById(id: string): Promise<boolean>

	/**
	 * Toggles the lock status of a document by its ID.
	 * @param _id The ID of the document to toggle the lock status of.
	 * @returns A promise that resolves to the result of the toggle operation.
	 */
	toggleLockById(id: string, clientSession?: ClientSession): Promise<T>

	updateById(_id: string, updateFields: UpdatableDocument<T>, clientSession?: ClientSession): Promise<T>

	// updateMany<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T & { updated_at?: UnixTimestamp, updated_by?: string }, options?: UpdateOptions & { returnResults?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>>

	// updateOne<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>>
}
