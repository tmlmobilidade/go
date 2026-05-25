/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache, type ApiCacheKey } from '@tmlmobilidade/databases';
import { type FastifyReply } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

interface LocationsApiPayload<T> {
	data: T[]
	status: 'success'
	timestamp: number
}

export async function sendLocationFeed<T>(reply: FastifyReply<unknown>, cacheKey: ApiCacheKey, serverKey: string, logCtx: string) {
	const raw = await apiCache.get(cacheKey);
	if (!raw) {
		Logger.error(`[${logCtx}] No data in cache or SERVERDB.`);
		const empty: LocationsApiPayload<T> = { data: [], status: 'success', timestamp: Date.now() };
		return reply
			.header('cache-control', 'public, max-age=3600')
			.code(HTTP_STATUS.OK)
			.send(JSON.stringify(empty));
	}

	const response: LocationsApiPayload<T> = {
		data: JSON.parse(raw) || [],
		status: 'success',
		timestamp: Date.now(),
	};

	return reply
		.header('cache-control', 'public, max-age=3600')
		.code(HTTP_STATUS.OK)
		.send(JSON.stringify(response));
}
