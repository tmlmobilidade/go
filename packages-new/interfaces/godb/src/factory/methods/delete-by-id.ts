/* * */

import { type DeleteOptions, type DeleteResult, type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
 * Finds a document by its ID.
 * @param context The context of the Mongo interface.
 * @param id The ID of the document to find.
 * @param options Optional find options.
 * @returns A promise that resolves to the matching document or null if not found.
 */
export async function deleteById<T extends Document>(context: GoDbCollectionContext<T>, _id: string, options?: DeleteOptions): Promise<DeleteResult> {
	return await context.collection.deleteOne({ _id: { $eq: _id as Filter<T>['_id'] } }, options);
}
