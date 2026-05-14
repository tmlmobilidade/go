/* * */

export type ApiCacheKeyParams = Record<string, boolean | number | string>;

export const ApiCacheKeyValues = [
	'hub:alerts:published:json',
	'hub:alerts:published:gtfs',
	'hub:alerts:published:rss',
	'hub:plans:approved:json',
	'hub:plans:gtfs',
	'hub:plans:gtfs:cm',
	'hub:facilities:json',
	'hub:facilities:helpdesks:json',
	'hub:facilities:boat_stations:json',
	'hub:facilities:light_rail_stations:json',
	'hub:facilities:subway_stations:json',
	'hub:facilities:train_stations:json',
	'hub:facilities:pips:json',
	'hub:facilities:schools:json',
	'hub:facilities:stores:json',
	'hub:locations:municipalities:json',
	'hub:locations:districts:json',
	'hub:locations:localities:json',
	'hub:locations:parishes:json',
	'hub:network:dates:json',
	'hub:network:periods:json',
	'hub:network:stops:json',
	'hub:network:lines:json',
	'hub:network:routes:json',
	'hub:network:plans:json',
	'hub:network:vehicles:json',
	'hub:network:vehicles:protobuf:json',
	'hub:network:patterns:{patternId}:json',
	'hub:network:shapes:{shapeId}:json',
] as const;

export type ApiCacheKey = typeof ApiCacheKeyValues[number];

export function resolveApiCacheKey(key: ApiCacheKey, params?: ApiCacheKeyParams): string {
	const resolvedKey = key.replace(/\{([^{}]+)\}/g, (_match, paramName: string) => {
		const value = params?.[paramName];
		if (typeof value === 'undefined' || value === null) {
			throw new Error(`[ApiCache] Missing key param "${paramName}" for key "${key}".`);
		}
		return String(value);
	});

	const unresolvedParam = resolvedKey.match(/\{([^{}]+)\}/);
	if (unresolvedParam) {
		throw new Error(`[ApiCache] Missing key param "${unresolvedParam[1]}" for key "${key}".`);
	}

	return resolvedKey;
}
