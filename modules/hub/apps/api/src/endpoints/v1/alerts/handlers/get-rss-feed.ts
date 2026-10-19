/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Returns an RSS feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRssFeedHandler(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	//
	// Get the published feed from the cache

	const cachedData = await cacheDb.get('hub:v1:alerts:published:rss');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getRssFeedHandler()] No RSS feed found in cache. Returning empty message.' });
		return reply
			.code(HTTP_STATUS.NO_CONTENT)
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.send();
	}

	//
	// Return the feed as XML

	return reply
		.code(HTTP_STATUS.OK)
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.type('application/rss+xml; charset=utf-8')
		.send(cachedData);
}
