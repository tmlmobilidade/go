/* * */

export const ApiCacheKeyValues = [
	'hub:alerts:published:json',
	'hub:alerts:published:gtfs',
	'hub:alerts:published:rss',
	'hub:plans:approved:json',
	'hub:plans:gtfs',
	'hub:plans:gtfs:cm',
] as const;

/* * */

export type ApiCacheKey = typeof ApiCacheKeyValues[number];
