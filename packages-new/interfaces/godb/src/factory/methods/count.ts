/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Counts documents matching the filter criteria.
 * @param filter The filter criteria to match documents.
 * @returns A promise that resolves to the count of matching documents.
 */
export async function count<T extends Document>(context: GoDbCollectionContext<T>, filter?: Filter<T>, options?: MinimalOptions): Promise<number> {
	return await context.collection.countDocuments(filter, { session: options?.session });
}
