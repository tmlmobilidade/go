/* * */

/**
 * Use this type to define MongoDB indexes.
 * This ensures only known properties are used
 * and allows for auto-applying indexes to collections.
 */
export interface SimplifiedMongoIndex<T> {
	expireAfterSeconds?: number
	key: Record<keyof T, -1 | 1>
	sparse?: boolean
	unique?: boolean
}

/**
 * A MongoDB index description type that is normalized
 * to ensure all expected properties are present and have consistent types.
 */
export type ComparableMongoIndex<T> = Required<SimplifiedMongoIndex<T>> & { name?: string };
