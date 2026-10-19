/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Checks if a document with the given key and value exists in the collection.
 * @param context The context of the collection.
 * @param key The key to check for existence.
 * @param value The value of the key to check for existence.
 * @param options The options for the query.
 * @returns A promise that resolves to true if the document exists, false otherwise.
 */
export async function exists<T extends Document>(context: GoDbCollectionContext<T>, key: keyof T, value: T[keyof T], options?: MinimalOptions): Promise<boolean> {
	const filter: Filter<T> = { [key]: value } as Filter<T>;
	const doc = await context.collection.findOne(filter, { projection: { [key]: 1 }, session: options?.session });
	return !!doc;
}
