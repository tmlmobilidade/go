/* * */

import type { IndexSpecification } from 'mongodb';

export interface SimplifiedMongoIndex<T> {
	expireAfterSeconds?: number
	key: IndexSpecification
	sparse?: boolean
	unique?: boolean
}
