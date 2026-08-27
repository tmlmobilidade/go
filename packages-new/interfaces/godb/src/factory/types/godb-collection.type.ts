/* * */

import type { AggregateOptions, AggregationCursor, BulkWriteOptions, Collection, DeleteOptions, DeleteResult, Document, Filter, FindOptions, Flatten, InsertManyResult, InsertOneOptions, InsertOneResult, UpdateOptions, UpdateResult, WithId } from '@tmlmobilidade/go-clients-mongo';
import type { AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import type { UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * The GoDB collection interface type.
 */
export interface GoDbCollection<T extends Document> {

	aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<T[]>

	aggregateCursor(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<AggregationCursor<T>>

	// count(filter?: Filter<T>): Promise<number>

	deleteById(id: T['_id'], options?: DeleteOptions): Promise<DeleteResult>

	// deleteMany(filter: Filter<T>): Promise<DeleteResult>

	deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult>

	// distinct<Key extends keyof WithId<T>>(key: Key, filter?: Filter<T>): Promise<Array<Flatten<WithId<T>[Key]>>>

	// exists<K extends keyof T>(key: K, value: T[K]): Promise<boolean>

	// existsById(id: T['_id']): Promise<boolean>

	findById(id: T['_id'], options?: FindOptions): Promise<null | T>

	findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]>

	findOne(filter: Filter<T>, options?: FindOptions): Promise<null | T>

	getCollection(): Promise<Collection<T>>

	// getCollectionName(): string

	// insertMany(docs: (T & { _id?: T['_id'], created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], options?: { options?: BulkWriteOptions, unsafe?: boolean }): Promise<InsertManyResult<T>>

	insertOne(doc: Omit<T, '_id'>, options?: InsertOneOptions): Promise<T>

	insertOneUnsafe(doc: T, options?: InsertOneOptions): Promise<T>

	// isLocked(filter: Filter<T>): Promise<boolean>

	// isLockedById(id: T['_id']): Promise<boolean>

	// toggleLockById(id: T['_id'], forceValue?: boolean): Promise<void>

	// updateById<TReturnDocument extends boolean = true>(id: T['_id'], updateFields: T, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>>

	// updateMany<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T & { updated_at?: UnixTimestamp, updated_by?: string }, options?: UpdateOptions & { returnResults?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>>

	// updateOne<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>>
}
