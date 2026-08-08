export * from './alerts.js';
export * from './metrics.js';
export * from './navegante.js';
export * from './network.js';
export * from './plans.js';
export * from './realtime.js';

/* * */

import { type HubAlertsCacheKey } from './alerts.js';
import { type HubMetricsCacheKey } from './metrics.js';
import { type HubNaveganteCacheKey } from './navegante.js';
import { type HubNetworkCacheKey } from './network.js';
import { type HubPlansCacheKey } from './plans.js';
import { type HubRealtimeCacheKey } from './realtime.js';

/* * */

export type CacheDbKey =
  | HubAlertsCacheKey
  | HubMetricsCacheKey
  | HubNaveganteCacheKey
  | HubNetworkCacheKey
  | HubPlansCacheKey
  | HubRealtimeCacheKey;
