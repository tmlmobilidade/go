/* * */

export const hubRealtimeEtaGtfsCacheKey = 'hub:v1:realtime:eta:gtfs';
export const hubRealtimeEtaJsonCacheKey = 'hub:v1:realtime:eta:json';
export const hubRealtimeVehicleMetadataJsonCacheKey = 'hub:v1:realtime:vehicles:metadata:json';
export const hubRealtimeVehiclePositionsGtfsCacheKey = 'hub:v1:realtime:vehicles:positions:gtfs';
export const hubRealtimeVehiclePositionsJsonCacheKey = 'hub:v1:realtime:vehicles:positions:json';

/* * */

export type HubRealtimeCacheKey =
  | typeof hubRealtimeEtaGtfsCacheKey
  | typeof hubRealtimeEtaJsonCacheKey
  | typeof hubRealtimeVehicleMetadataJsonCacheKey
  | typeof hubRealtimeVehiclePositionsGtfsCacheKey
  | typeof hubRealtimeVehiclePositionsJsonCacheKey;
