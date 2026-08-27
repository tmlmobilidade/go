/* * */

import type { AggregateOptions, AggregationCursor, BulkWriteOptions, Collection, DeleteOptions, DeleteResult, Document, Filter, FindOptions, Flatten, InsertManyResult, InsertOneOptions, InsertOneResult, UpdateOptions, UpdateResult, WithId } from '@tmlmobilidade/go-clients-mongo';
import type { AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import type { UnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { InsertableDocument } from './insertable-document.type.js';
import { UpdatableDocument } from './updatable-document.type.js';

/**
 * The GoDB collection interface type.
 */
export interface GoDbCollection<T extends Document> {

	aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<T[]>

	aggregateCursor(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<AggregationCursor<T>>

	// count(filter?: Filter<T>): Promise<number>

	deleteById(_id: string, options?: DeleteOptions): Promise<DeleteResult>

	// deleteMany(filter: Filter<T>): Promise<DeleteResult>

	deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult>

	// distinct<Key extends keyof WithId<T>>(key: Key, filter?: Filter<T>): Promise<Array<Flatten<WithId<T>[Key]>>>

	// exists<K extends keyof T>(key: K, value: T[K]): Promise<boolean>

	// existsById(id: string): Promise<boolean>

	findById(_id: string, options?: FindOptions): Promise<null | T>

	findMany(filter?: Filter<T>, options?: FindOptions): Promise<WithId<T>[]>

	findOne(filter: Filter<T>, options?: FindOptions): Promise<null | T>

	getCollection(): Promise<Collection<T>>

	// getCollectionName(): string

	// insertMany(docs: (T & { _id?: string, created_at?: UnixTimestamp, created_by?: string, updated_at?: UnixTimestamp, updated_by?: string })[], options?: { options?: BulkWriteOptions, unsafe?: boolean }): Promise<InsertManyResult<T>>

	insertOne(doc: InsertableDocument<T>, options?: InsertOneOptions): Promise<T>

	insertOneUnsafe(doc: T, options?: InsertOneOptions): Promise<T>

	// isLocked(filter: Filter<T>): Promise<boolean>

	// isLockedById(id: string): Promise<boolean>

	// toggleLockById(id: string, forceValue?: boolean): Promise<void>

	updateById(_id: string, updateFields: UpdatableDocument<T>, options?: UpdateOptions): Promise<T>

	// updateMany<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T & { updated_at?: UnixTimestamp, updated_by?: string }, options?: UpdateOptions & { returnResults?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>>

	// updateOne<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T, options?: UpdateOptions & { forceIfLocked?: boolean, returnResult?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T> : UpdateResult<T>>
}
