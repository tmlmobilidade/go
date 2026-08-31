/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type Document, type Filter, type OptionalUnlessRequiredId } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Inserts a single document into the collection.
 * @param doc The document to insert.
 * @param options The options for the insert operation.
 * @returns A promise that resolves to the result of the insert operation.
 */
export async function insertOneUnsafe<T extends Document>(context: GoDbCollectionContext<T>, doc: OptionalUnlessRequiredId<T>, options?: MinimalOptions): Promise<T> {
	// Attempt to insert the document into the collection
	const result = await context.collection.insertOne(doc, { session: options?.session });
	// Check if the insert operation was acknowledged
	if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to insert document', result);
	// Otherwise, fetch and return the inserted document
	const insertedDoc = await context.collection.findOne({ _id: { $eq: result.insertedId as Filter<T>['_id'] } }, options);
	if (!insertedDoc) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find inserted document', result);
	return insertedDoc as unknown as T;
}
