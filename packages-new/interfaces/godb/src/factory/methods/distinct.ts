/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
 * Counts documents matching the filter criteria.
 * @param filter The filter criteria to match documents.
 * @returns A promise that resolves to the count of matching documents.
 */
export async function distinct<T extends Document, Key extends keyof T>(context: GoDbCollectionContext<T>, key: Key, filter?: Filter<T>): Promise<Array<T[Key]>> {
	return await context.collection.distinct(key as string, filter ?? {});
}
