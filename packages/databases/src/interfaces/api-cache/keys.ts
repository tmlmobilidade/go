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
	'hub:realtime:vehicles:metadata:json',
	'hub:realtime:vehicles:positions:json',
	'hub:realtime:vehicles:positions:protobuf',
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
