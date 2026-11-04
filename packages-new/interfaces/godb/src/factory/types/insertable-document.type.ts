/* * */

import { type Document } from '@tmlmobilidade/go-clients-mongo';

/**
 * The insertable document type.
 * Represents a document that can be inserted into the collection.
 */
// Distribute over unions so variant-specific fields stay available to callers.
export type InsertableDocument<T extends Document> = T extends Document
	? Omit<T, '_id' | 'created_at' | 'updated_at'>
	: never;
