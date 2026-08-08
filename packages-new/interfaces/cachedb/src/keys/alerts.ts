/* * */

export const hubPublishedAlertsGtfsCacheKey = 'hub:v1:alerts:published:gtfs';
export const hubPublishedAlertsGtfsCmCacheKey = 'hub:v1:alerts:published:gtfs:cm';
export const hubPublishedAlertsJsonCacheKey = 'hub:v1:alerts:published:json';
export const hubPublishedAlertsJsonCmCacheKey = 'hub:v1:alerts:published:json:cm';
export const hubPublishedAlertsRssCacheKey = 'hub:v1:alerts:published:rss';
export const hubPublishedAlertsRssCmCacheKey = 'hub:v1:alerts:published:rss:cm';

/* * */

export type HubAlertsCacheKey =
  | typeof hubPublishedAlertsGtfsCacheKey
  | typeof hubPublishedAlertsGtfsCmCacheKey
  | typeof hubPublishedAlertsJsonCacheKey
  | typeof hubPublishedAlertsJsonCmCacheKey
  | typeof hubPublishedAlertsRssCacheKey
  | typeof hubPublishedAlertsRssCmCacheKey;
