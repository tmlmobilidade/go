/* * */

export type HubHistoricalDemandByLineMetricsCacheKey = `hub:v2:metrics:historical:demand-by-line:${string}:json`;
export type HubHistoricalDemandByPatternMetricsCacheKey = `hub:v2:metrics:historical:demand-by-pattern:${string}:json`;

/* * */

export const hubHistoricalDemandByAgencyMetricsCacheKey = 'hub:v2:metrics:historical:demand-by-agency:json';
export const hubHistoricalDemandByLineMetricsCacheKey = (lineId: string): HubHistoricalDemandByLineMetricsCacheKey => `hub:v2:metrics:historical:demand-by-line:${lineId}:json`;
export const hubHistoricalDemandByLineMetricsCachePattern = 'hub:v2:metrics:historical:demand-by-line:*:json';
export const hubHistoricalDemandByPatternMetricsCacheKey = (patternId: string): HubHistoricalDemandByPatternMetricsCacheKey => `hub:v2:metrics:historical:demand-by-pattern:${patternId}:json`;
export const hubHistoricalDemandByPatternMetricsCachePattern = 'hub:v2:metrics:historical:demand-by-pattern:*:json';

export const hubRealtimeDepartureDelayMetricsCacheKey = 'hub:v2:metrics:realtime:departure-delays:json';
export const hubRealtimePassengerDemandMetricsCacheKey = 'hub:v2:metrics:realtime:passenger-demand:json';
export const hubRealtimeServiceComplianceMetricsCacheKey = 'hub:v2:metrics:realtime:service-compliance:json';
export const hubRealtimeVkmExecutionMetricsCacheKey = 'hub:v2:metrics:realtime:vkm-execution:json';

export const legacyHubDepartureDelayMetricsCacheKey = 'hub:v2:metrics:departure-delays:json';
export const legacyHubPassengerDemandMetricsCacheKey = 'hub:v2:metrics:passenger-demand:json';
export const legacyHubServiceComplianceMetricsCacheKey = 'hub:v2:metrics:service-compliance:json';
export const legacyHubVkmExecutionMetricsCacheKey = 'hub:v2:metrics:vkm-execution:json';

/* * */

export type HubMetricsCacheKey =
  | HubHistoricalDemandByLineMetricsCacheKey
  | HubHistoricalDemandByPatternMetricsCacheKey
  | typeof hubHistoricalDemandByAgencyMetricsCacheKey
  | typeof hubRealtimeDepartureDelayMetricsCacheKey
  | typeof hubRealtimePassengerDemandMetricsCacheKey
  | typeof hubRealtimeServiceComplianceMetricsCacheKey
  | typeof hubRealtimeVkmExecutionMetricsCacheKey
  | typeof legacyHubDepartureDelayMetricsCacheKey
  | typeof legacyHubPassengerDemandMetricsCacheKey
  | typeof legacyHubServiceComplianceMetricsCacheKey
  | typeof legacyHubVkmExecutionMetricsCacheKey;
