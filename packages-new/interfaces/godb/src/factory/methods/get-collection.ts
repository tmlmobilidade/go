/* * */

import { type Collection, type Document } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/**
	 * Gets the MongoDB collection instance.
	 * @returns The MongoDB collection instance
	 */
export async function getCollection<T extends Document>(context: GoDbCollectionContext<T>): Promise<Collection<T>> {
	return context.collection;
}
