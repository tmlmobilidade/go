/* * */

import type { IndexSpecification } from 'mongodb';
/**
 * Use this type to define MongoDB indexes.
 * This ensures only known properties are used
 * and allows for auto-applying indexes to collections.
 */
export interface SimplifiedMongoIndex<T> {
	expireAfterSeconds?: number
	key: IndexSpecification
	sparse?: boolean
	unique?: boolean
}

