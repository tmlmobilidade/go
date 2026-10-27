import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/* * */

/** Atomically replace a complete validated document if the filter still matches. */
export async function replaceOne<T extends Document>(context: GoDbCollectionContext<T>, filter: Filter<T>, document: T, options?: MinimalOptions & { upsert?: boolean }): Promise<null | T> {
	if (!context.schema) throw new Error(`No schema defined for ${context.collectionName}.`);
	const validatedDocument = context.schema.parse(document);
	const result = await context.collection.findOneAndReplace(filter, validatedDocument, { returnDocument: 'after', session: options?.session, upsert: options?.upsert });
	return result ? context.schema.parse(result) : null;
}
