/* * */

import { type DeleteOptions, type DeleteResult, type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
 * Deletes a document by a filter.
 * @param context The context of the Mongo interface.
 * @param filter The filter to use to delete the document.
 * @param options Optional delete options.
 * @returns A promise that resolves to the result of the delete operation.
 */
export async function deleteOne<T extends Document>(context: GoDbCollectionContext<T>, filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
	return await context.collection.deleteOne(filter, options);
}
