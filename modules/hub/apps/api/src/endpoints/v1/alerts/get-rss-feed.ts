/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns an RSS feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRssFeed(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	const cachedData = await apiCache.get('hub:alerts:published:rss');

	if (!cachedData) {
		Logger.error('[hub/v1/alerts:getRssFeed()] No RSS feed found in cache. Returning empty message.');
		return reply
			.code(HTTP_STATUS.NO_CONTENT)
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.send();
	};

	return reply
		.code(HTTP_STATUS.OK)
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.type('application/rss+xml; charset=utf-8')
		.send(cachedData);
}
