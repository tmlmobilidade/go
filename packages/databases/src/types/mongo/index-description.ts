/* * */

/**
 * Use this type to define MongoDB indexes.
 * This ensures only known properties are used
 * and allows for auto-applying indexes to collections.
 */
export interface SimplifiedMongoIndex<T> {
	expireAfterSeconds?: number
	key: Partial<Record<keyof T, -1 | 1>>
	sparse?: boolean
	unique?: boolean
}

