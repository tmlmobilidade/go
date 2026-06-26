/* * */

import { type SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import { type CreateIndexesOptions, type IndexDescriptionInfo } from 'mongodb';

/**
 * Prepares MongoDB index options by extracting relevant properties
 * from a simplified index description. This function ensures that
 * only valid options are included when creating indexes in MongoDB.
 * @param idx A simplified index description defined by the user.
 * @returns An object containing valid MongoDB index options based on the provided description.
 */
export function prepareMongoIndexOptions<T>(idx: SimplifiedMongoIndex<T>): CreateIndexesOptions {
	const result: CreateIndexesOptions = {};
	if (idx.expireAfterSeconds !== undefined) result.expireAfterSeconds = idx.expireAfterSeconds;
	if (idx.sparse !== undefined) result.sparse = idx.sparse;
	if (idx.unique !== undefined) result.unique = idx.unique;
	return result;
}

/**
 * Normalizes a MongoDB index description by ensuring that
 * all expected properties are present and have consistent types.
 * @param indexDescription The existing indexes from MongoDB or a simplified structure defined by the user.
 * @returns A normalized index description with default values for missing properties.
 */
function normalizeMongoIndex<T>(indexDescription: IndexDescriptionInfo | SimplifiedMongoIndex<T>): SimplifiedMongoIndex<T> {
	return {
		expireAfterSeconds: indexDescription.expireAfterSeconds ?? undefined,
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
export function isSameIndex<T>(a: IndexDescriptionInfo | SimplifiedMongoIndex<T>, b: IndexDescriptionInfo | SimplifiedMongoIndex<T>): boolean {
	// Normalize both index descriptions
	// to ensure consistent comparison.
	const normalizedA = normalizeMongoIndex(a);
	const normalizedB = normalizeMongoIndex(b);
	// Sort keys to ensure consistent comparison regardless of order.
	const aKeySorted = Object.fromEntries(Object.entries(normalizedA.key).sort());
	const bKeySorted = Object.fromEntries(Object.entries(normalizedB.key).sort());
	// Check if keys are the same and if unique/sparse settings match.
	const matchingKeys = JSON.stringify(aKeySorted) === JSON.stringify(bKeySorted);
	const matchingUnique = !!normalizedA.unique === !!normalizedB.unique;
	const matchingSparse = !!normalizedA.sparse === !!normalizedB.sparse;
	const matchingExpire = normalizedA.expireAfterSeconds === normalizedB.expireAfterSeconds;
	// Consider indexes the same if all properties match.
	return matchingKeys && matchingUnique && matchingSparse && matchingExpire;
}
