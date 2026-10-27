import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/* * */

/** Atomically insert by a stable ID, preserving an existing acknowledgement unchanged. */
export async function insertOneIfAbsent<T extends Document>(context: GoDbCollectionContext<T>, document: T, options?: MinimalOptions): Promise<T> {
	if (!context.schema) throw new Error(`No schema defined for ${context.collectionName}.`);
	const validatedDocument = context.schema.parse(document);
	const result = await context.collection.findOneAndUpdate(
		{ _id: { $eq: validatedDocument._id as Filter<T>['_id'] } },
		{ $setOnInsert: validatedDocument },
		{ returnDocument: 'after', session: options?.session, upsert: true },
	);
	if (!result) throw new Error(`Failed to acknowledge document in ${context.collectionName}.`);
	return context.schema.parse(result);
}
