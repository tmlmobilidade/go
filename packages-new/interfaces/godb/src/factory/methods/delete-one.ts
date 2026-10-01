/* * */

import { type DeleteResult, type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Deletes a single document by a filter.
 * @param context The context of the Mongo interface.
 * @param filter The filter to use to delete the document.
 * @returns A promise that resolves to the result of the delete operation.
 */
export async function deleteOne<T extends Document>(context: GoDbCollectionContext<T>, filter: Filter<T>, options?: MinimalOptions): Promise<DeleteResult> {
	return await context.collection.deleteOne(filter, { session: options?.session });
}
