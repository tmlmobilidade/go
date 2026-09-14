/* * */

import type { AggregateOptions, AggregationCursor, AggregationPipeline, BulkWriteResult, Collection, DeleteResult, Document, Filter } from '@tmlmobilidade/go-clients-mongo';

import { type InsertableDocument } from './insertable-document.type.js';
import { type MinimalOptions } from './minimal-options.type.js';
import { type UpdatableDocument } from './updatable-document.type.js';

/**
 * The GoDB collection interface type.
 */
export interface GoDbCollection<T extends Document> {

	aggregate(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<T[]>

	aggregateCursor(pipeline: AggregationPipeline<T>, options?: AggregateOptions): Promise<AggregationCursor<T>>

	count(filter?: Filter<T>, options?: MinimalOptions): Promise<number>

	deleteById(_id: string, options?: MinimalOptions): Promise<DeleteResult>

	deleteMany(filter: Filter<T>, options?: MinimalOptions): Promise<DeleteResult>

	deleteOne(filter: Filter<T>, options?: MinimalOptions): Promise<DeleteResult>

	distinct<Key extends keyof T>(key: Key, filter?: Filter<T>): Promise<Array<T[Key]>>

	exists<Key extends keyof T>(key: Key, value: T[Key], options?: MinimalOptions): Promise<boolean>

	findById(_id: string, options?: MinimalOptions): Promise<null | T>

	findMany(filter?: Filter<T>, options?: MinimalOptions): Promise<T[]>

	findOne(filter: Filter<T>, options?: Pick<MinimalOptions, 'projection' | 'session' | 'sort'>): Promise<null | T>

	getCollection(): Promise<Collection<T>>

	// getCollectionName(): string

	insertMany(docs: InsertableDocument<T>[], options?: MinimalOptions): Promise<T[]>

	insertOne(doc: InsertableDocument<T>, options?: MinimalOptions): Promise<T>

	insertOneUnsafe(doc: T, options?: MinimalOptions): Promise<T>

	/**
	 * @deprecated Use `updateOne` instead.
	 */
	updateById(_id: string, updateFields: UpdatableDocument<T>, options?: MinimalOptions): Promise<T>

	updateOne(filter: Filter<T>, updateFields: UpdatableDocument<T>, options?: MinimalOptions): Promise<T>

	// updateMany<TReturnDocument extends boolean = true>(filter: Filter<T>, updateFields: T & { updated_at?: UnixMilliseconds, updated_by?: string }, options?: UpdateOptions & { returnResults?: TReturnDocument }): Promise<TReturnDocument extends true ? WithId<T>[] : UpdateResult<T>>

	upsertManyUnsafe(docs: T[], options?: MinimalOptions): Promise<BulkWriteResult>
}
