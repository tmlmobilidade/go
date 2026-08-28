/* * */

import { type ClientSession, type FindOptions } from '@tmlmobilidade/go-clients-mongo';

/**
 * Represents a subset of available options for a MongoDB operation,
 * simplifying the interface for the most common use cases.
 */
export interface MinimalOptions {
	projection?: FindOptions['projection']
	session?: ClientSession
	sort?: FindOptions['sort']
}
