/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Finds a document by a filter.
 * @param context The context of the Mongo interface.
 * @param filter The filter to use to find the document.
 * @param options Optional find options.
 * @returns A promise that resolves to the matching document or null if not found.
 */
export async function findMany<T extends Document>(context: GoDbCollectionContext<T>, filter?: Filter<T>, options?: MinimalOptions): Promise<T[]> {
	return await context.collection.find<T>(filter ?? {}, {
		limit: options?.limit,
		projection: options?.projection,
		session: options?.session,
		sort: options?.sort,
	}).toArray();
}
