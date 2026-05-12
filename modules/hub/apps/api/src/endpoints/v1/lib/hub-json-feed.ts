/* * */

import { apiCache, type ApiCacheKey, type ApiCacheKeyParams } from '@tmlmobilidade/databases';
import { SERVERDB } from '@tmlmobilidade/go-hub-pckg-services/SERVERDB';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function readThroughHubJson(cacheKey: ApiCacheKey, serverKey: string, logLabel: string, cacheKeyParams?: ApiCacheKeyParams): Promise<null | string> {
	const cached = await apiCache.get(cacheKey, cacheKeyParams);
	if (cached) return cached;

	const fromDb = await SERVERDB.get(serverKey);
	if (typeof fromDb === 'string' && fromDb.length > 0) {
		try {
			await apiCache.set(cacheKey, fromDb, undefined, cacheKeyParams);
		} catch (error) {
			Logger.error(`[${logLabel}] apiCache.set failed`, error instanceof Error ? error : undefined);
		}
		return fromDb;
	}

	return null;
}
