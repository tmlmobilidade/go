/* * */

import { type DeleteResult, type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Deletes a document by its ID.
 * @param context The context of the Mongo interface.
 * @param _id The ID of the document to delete.
 * @returns A promise that resolves to the result of the delete operation.
 */
export async function deleteById<T extends Document>(context: GoDbCollectionContext<T>, _id: number | string, options?: MinimalOptions): Promise<DeleteResult> {
	return await context.collection.deleteOne({ _id: { $eq: _id as Filter<T>['_id'] } }, { session: options?.session });
}
