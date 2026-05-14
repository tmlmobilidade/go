/* * */

import { apiCache, type ApiCacheKey, type ApiCacheKeyParams } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function readThroughHubJson(cacheKey: ApiCacheKey, serverKey: string, logLabel: string, cacheKeyParams?: ApiCacheKeyParams): Promise<null | string> {
	const cached = await apiCache.get(cacheKey, cacheKeyParams);
	if (cached) return cached;

	const fromDb = await apiCache.get(serverKey as ApiCacheKey);
	if (typeof fromDb === 'string' && fromDb.length > 0) {
		try {
			await apiCache.set(cacheKey, fromDb, { params: cacheKeyParams });
		} catch (error) {
			Logger.error(`[${logLabel}] apiCache.set failed`, error instanceof Error ? error : undefined);
		}
		return fromDb;
	}

	return null;
}
