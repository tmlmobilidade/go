/* * */

const dynamicKey = () => 'use-for-dynamic-key';

export const cacheDbKeyValues = [
	'hub:v1:navegante:app-enabled',
	'hub:v1:alerts:published:json',
	'hub:v1:alerts:published:json:cm',
	'hub:v1:alerts:published:gtfs',
	'hub:v1:alerts:published:gtfs:cm',
	'hub:v1:alerts:published:rss',
	'hub:v1:alerts:published:rss:cm',
	'hub:v1:plans:approved:json',
	'hub:v1:realtime:vehicles:metadata:json',
	'hub:v1:realtime:vehicles:positions:json',
	'hub:v1:realtime:vehicles:positions:gtfs',
	'hub:v1:realtime:eta:all',
	'hub:v1:realtime:eta:all:gtfs',
	`hub:v1:realtime:eta:by-trip:${dynamicKey()}`,
	`hub:v1:realtime:eta:by-stop:${dynamicKey()}`,
	`hub:v1:realtime:eta:by-trip:${dynamicKey()}:gtfs`,
	`hub:v1:realtime:eta:by-stop:${dynamicKey()}:gtfs`,
	'hub:v1:network:dates',
	'hub:v1:network:periods',
	'hub:v1:network:stops',
	'hub:v1:network:legacy-stops-map',
	'hub:v1:network:lines',
	'hub:v1:network:routes',
	'hub:v1:network:plans',
	'hub:v1:metrics:demand:by-agency:by-operational-date:json',
	'hub:v1:network:vehicles:protobuf',
	`hub:v1:network:patterns:${dynamicKey()}`,
	`hub:v1:network:shapes:${dynamicKey()}`,
] as const;

export type CacheDbKey = typeof cacheDbKeyValues[number];
