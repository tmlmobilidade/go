/* * */

import { type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { type RawApexTransaction } from '@tmlmobilidade/go-types-apex';

/* * */

/**
 * **IMPORTANT**:
 * Automatic sorting (ESLint) of keys in the JS objects should be disabled.
 * The order of keys in a compound index is very important and should be
 * carefully considered based on the cardinality of each key.
 */
export const transactionsIndexes: SimplifiedMongoIndex<RawApexTransaction>[] = [
	{ key: { created_at: 1 } },
	{ key: { agency_id: 1, created_at: 1 } },
	// eslint-disable-next-line perfectionist/sort-objects
	{ key: { version_id: 1, created_at: 1 } },
	// eslint-disable-next-line perfectionist/sort-objects
	{ key: { version_id: 1, received_at: 1 } },
];
