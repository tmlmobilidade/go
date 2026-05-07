/* * */

export const ApiCacheKeyValues = [
	'hub:alerts:published:json',
	'hub:alerts:published:gtfs',
	'hub:alerts:published:rss',
] as const;

/* * */

export type ApiCacheKey = typeof ApiCacheKeyValues[number];
