/* * */

export type ApiCacheKeyParams = Record<string, boolean | number | string>;

export const ApiCacheKeyValues = [
	'hub:alerts:published:json',
	'hub:alerts:published:gtfs',
	'hub:alerts:published:rss',
	'hub:plans:approved:json',
	'hub:plans:gtfs',
	'hub:plans:gtfs:cm',
	'hub:facilities',
	'hub:facilities:helpdesk',
	'hub:facilities:boat_stations',
	'hub:facilities:light_rail_stations',
	'hub:facilities:subway_stations',
	'hub:facilities:train_stations',
	'hub:facilities:pips',
	'hub:facilities:schools',
	'hub:facilities:stores',
	'hub:locations:municipalities',
	'hub:locations:districts',
	'hub:locations:localities',
	'hub:locations:parishes',
	'hub:network:dates',
	'hub:network:periods',
	'hub:network:stops',
	'hub:network:lines',
	'hub:network:routes',
	'hub:network:plans',
	'hub:network:vehicles',
	'hub:network:vehicles:protobuf',
	'hub:network:patterns:{patternId}',
	'hub:network:shapes:{shapeId}',
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
