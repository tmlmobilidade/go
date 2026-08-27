/* * */

import { type Document, type FindOptions } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
 * Finds a document by its ID.
 * @param context The context of the Mongo interface.
 * @param id The ID of the document to find.
 * @param options Optional find options.
 * @returns A promise that resolves to the matching document or null if not found.
 */
export async function findById<T extends Document>(context: GoDbCollectionContext<T>, id: T['_id'], options?: FindOptions): Promise<null | T> {
	return await context.collection.findOne({ _id: { $eq: id } }, options);
}
