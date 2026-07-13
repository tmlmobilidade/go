/* * */

import type { SimplifiedMongoIndex } from '@/types/mongo/index-description.js';
import type { CreateIndexesOptions, IndexDescriptionInfo } from 'mongodb';

export function prepareMongoIndexOptions<T>(idx: SimplifiedMongoIndex<T>): CreateIndexesOptions {
	const result: CreateIndexesOptions = {};
	if (idx.expireAfterSeconds !== undefined) result.expireAfterSeconds = idx.expireAfterSeconds;
	if (idx.sparse !== undefined) result.sparse = idx.sparse;
	if (idx.unique !== undefined) result.unique = idx.unique;
	return result;
}

function normalizeMongoIndex<T>(indexDescription: IndexDescriptionInfo | SimplifiedMongoIndex<T>): SimplifiedMongoIndex<T> {
	return {
		expireAfterSeconds: indexDescription.expireAfterSeconds ?? undefined,
		key: indexDescription.key as Record<keyof T, -1 | 1>,
		sparse: !!indexDescription.sparse,
		unique: !!indexDescription.unique,
	};
}

export function isSameIndex<T>(a: IndexDescriptionInfo | SimplifiedMongoIndex<T>, b: IndexDescriptionInfo | SimplifiedMongoIndex<T>): boolean {
	const normalizedA = normalizeMongoIndex(a);
	const normalizedB = normalizeMongoIndex(b);
	const aKeySorted = Object.fromEntries(Object.entries(normalizedA.key).sort());
	const bKeySorted = Object.fromEntries(Object.entries(normalizedB.key).sort());
	const matchingKeys = JSON.stringify(aKeySorted) === JSON.stringify(bKeySorted);
	const matchingUnique = !!normalizedA.unique === !!normalizedB.unique;
	const matchingSparse = !!normalizedA.sparse === !!normalizedB.sparse;
	const matchingExpire = normalizedA.expireAfterSeconds === normalizedB.expireAfterSeconds;
	return matchingKeys && matchingUnique && matchingSparse && matchingExpire;
}
