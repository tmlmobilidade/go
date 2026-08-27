/* * */

import { type Document } from '@tmlmobilidade/go-clients-mongo';

/**
 * The updatable document type.
 * Represents a document that can be updated in the collection.
 */
export type UpdatableDocument<T extends Document> = Partial<Omit<T, '_id' | 'created_at' | 'created_by' | 'updated_at'>>;
