/* * */

import { type ComparableMongoIndex, type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { type IndexDescriptionInfo } from 'mongodb';

/**
 * Normalizes a MongoDB index description by ensuring that
 * all expected properties are present and have consistent types.
 * @param indexDescription The original index description from MongoDB.
 * @returns A normalized index description with default values for missing properties.
 */
export function normalizeMongoIndex<T>(indexDescription: IndexDescriptionInfo | SimplifiedMongoIndex<T>): ComparableMongoIndex<T> {
	return {
		expireAfterSeconds: indexDescription.expireAfterSeconds ?? null,
		key: indexDescription.key as Record<keyof T, -1 | 1>,
		sparse: !!indexDescription.sparse,
		unique: !!indexDescription.unique,
	};
}

/**
 * Compares two normalized MongoDB index descriptions for equivalence.
 * Two indexes are considered the same if they have identical key definitions
 * and the same settings for uniqueness and sparsity.
 * @param a The first normalized index description to compare.
 * @param b The second normalized index description to compare.
 * @returns True if the indexes are considered the same, false otherwise.
 */
export function isSameIndex<T>(a: ComparableMongoIndex<T>, b: ComparableMongoIndex<T>): boolean {
	// Sort keys to ensure consistent comparison regardless of order.
	const aKeySorted = Object.fromEntries(Object.entries(a.key).sort());
	const bKeySorted = Object.fromEntries(Object.entries(b.key).sort());
	// Check if keys are the same and if unique/sparse settings match.
	const matchingKeys = JSON.stringify(aKeySorted) === JSON.stringify(bKeySorted);
	const matchingUnique = !!a.unique === !!b.unique;
	const matchingSparse = !!a.sparse === !!b.sparse;
	const matchingExpire = a.expireAfterSeconds === b.expireAfterSeconds;
	// Consider indexes the same if all properties match.
	return matchingKeys && matchingUnique && matchingSparse && matchingExpire;
}
