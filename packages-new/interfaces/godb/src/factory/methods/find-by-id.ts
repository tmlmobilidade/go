/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Finds a document by its ID.
 * @param context The context of the Mongo interface.
 * @param id The ID of the document to find.
 * @param options Optional find options.
 * @returns A promise that resolves to the matching document or null if not found.
 */
export async function findById<T extends Document>(context: GoDbCollectionContext<T>, _id: string, options?: MinimalOptions): Promise<null | T> {
	return await context.collection.findOne<T>({ _id: { $eq: _id as Filter<T>['_id'] } }, {
		projection: options?.projection,
		session: options?.session,
	});
}
