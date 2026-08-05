/* * */

const dynamicKey = () => 'use-for-dynamic-key';

export const hubDepartureDelayMetricsCacheKey = 'hub:v2:metrics:departure-delays:json';
export const hubPassengerDemandMetricsCacheKey = 'hub:v2:metrics:passenger-demand:json';
export const hubServiceComplianceMetricsCacheKey = 'hub:v2:metrics:service-compliance:json';
export const hubVkmExecutionMetricsCacheKey = 'hub:v2:metrics:vkm-execution:json';

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
	'hub:v1:realtime:eta:json',
	'hub:v1:realtime:eta:gtfs',
	'hub:v1:network:dates',
	'hub:v1:network:periods',
	'hub:v1:network:stops',
	'hub:v1:network:legacy-stops-map',
	'hub:v1:network:lines',
	'hub:v1:network:routes',
	'hub:v1:network:plans',
	hubDepartureDelayMetricsCacheKey,
	hubPassengerDemandMetricsCacheKey,
	hubServiceComplianceMetricsCacheKey,
	'hub:v1:network:vehicles:protobuf',
	hubVkmExecutionMetricsCacheKey,
	`hub:v1:network:patterns:${dynamicKey()}`,
	`hub:v1:network:shapes:${dynamicKey()}`,
] as const;

export type cacheDbKey = typeof cacheDbKeyValues[number];
