/* * */

export type HubNetworkPatternCacheKey = `hub:v1:network:patterns:${string}`;
export type HubNetworkShapeCacheKey = `hub:v1:network:shapes:${string}`;

/* * */

export const hubNetworkDatesCacheKey = 'hub:v1:network:dates';
export const hubNetworkLegacyStopsMapCacheKey = 'hub:v1:network:legacy-stops-map';
export const hubNetworkLinesCacheKey = 'hub:v1:network:lines';
export const hubNetworkPatternCacheKey = (patternId: string): HubNetworkPatternCacheKey => `hub:v1:network:patterns:${patternId}`;
export const hubNetworkPatternsCachePattern = 'hub:v1:network:patterns:*';
export const hubNetworkPeriodsCacheKey = 'hub:v1:network:periods';
export const hubNetworkPlansCacheKey = 'hub:v1:network:plans';
export const hubNetworkRoutesCacheKey = 'hub:v1:network:routes';
export const hubNetworkShapeCacheKey = (shapeId: string): HubNetworkShapeCacheKey => `hub:v1:network:shapes:${shapeId}`;
export const hubNetworkShapesCachePattern = 'hub:v1:network:shapes:*';
export const hubNetworkStopsCacheKey = 'hub:v1:network:stops';
export const hubNetworkVehiclesProtobufCacheKey = 'hub:v1:network:vehicles:protobuf';

/* * */

export type HubNetworkCacheKey =
  | HubNetworkPatternCacheKey
  | HubNetworkShapeCacheKey
  | typeof hubNetworkDatesCacheKey
  | typeof hubNetworkLegacyStopsMapCacheKey
  | typeof hubNetworkLinesCacheKey
  | typeof hubNetworkPeriodsCacheKey
  | typeof hubNetworkPlansCacheKey
  | typeof hubNetworkRoutesCacheKey
  | typeof hubNetworkStopsCacheKey
  | typeof hubNetworkVehiclesProtobufCacheKey;
