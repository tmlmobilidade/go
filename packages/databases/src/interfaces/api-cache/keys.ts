/* * */

export const ApiCacheKeyValues = [
	'alerts:all',
] as const;

/* * */

export type ApiCacheKey = typeof ApiCacheKeyValues[number];
