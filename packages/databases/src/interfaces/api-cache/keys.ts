/* * */

const dynamicKey = () => 'use-for-dynamic-key';

export const ApiCacheKeyValues = [
	'hub:alerts:published:json',
	'hub:alerts:published:json:cm',
	'hub:alerts:published:gtfs',
	'hub:alerts:published:gtfs:cm',
	'hub:alerts:published:rss',
	'hub:alerts:published:rss:cm',
	'hub:plans:approved:json',
	'hub:plans:active:json',
	'hub:realtime:vehicles:metadata:json',
	'hub:realtime:vehicles:positions:json',
	'hub:realtime:vehicles:positions:gtfs',
	'hub:realtime:eta:json',
	'hub:realtime:eta:gtfs',
	'hub:network:dates',
	'hub:network:periods',
	'hub:network:stops',
	'hub:network:lines',
	'hub:network:routes',
	'hub:network:plans',
	'hub:network:vehicles:protobuf',
	`hub:network:patterns:${dynamicKey()}`,
	`hub:network:shapes:${dynamicKey()}`,
] as const;

export type ApiCacheKey = typeof ApiCacheKeyValues[number];
