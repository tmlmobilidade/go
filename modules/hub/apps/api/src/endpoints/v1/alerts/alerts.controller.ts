/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodeGtfsRtFeed, getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export class AlertsController {
	//

	/**
	 * Returns a JSON feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getJsonFeed(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
		//

		const cachedData = await apiCache.get('hub:alerts:published:json');

		if (!cachedData) {
			Logger.error('[hub/v1/alerts:getJsonFeed()] No JSON feed found in cache. Returning empty array.');
			return reply
				.header('cache-control', 'public, max-age=20')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('cache-control', 'public, max-age=20')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Returns a GTFS-RT JSON feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfsRtJsonFeed(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
		//

		const cachedData = await apiCache.get('hub:alerts:published:gtfs');

		if (!cachedData) {
			Logger.error('[hub/v1/alerts:getGtfsRtJsonFeed()] No GTFS-RT feed found in cache. Returning empty message.');
			return reply
				.code(HTTP_STATUS.NO_CONTENT)
				.header('cache-control', 'public, max-age=20')
				.send({
					data: getEmptyGtfsRtFeedMessage(),
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.code(HTTP_STATUS.OK)
			.header('cache-control', 'public, max-age=20')
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Returns a GTFS-RT Protobuf feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfsRtProtobufFeed(request: FastifyRequest, reply: FastifyReply<Buffer>) {
		//

		const cachedData = await apiCache.get('hub:alerts:published:gtfs');

		if (!cachedData) {
			Logger.error('[hub/v1/alerts:getGtfsRtProtobufFeed()] No GTFS-RT feed found in cache. Returning empty message.');
			return reply
				.code(HTTP_STATUS.NO_CONTENT)
				.header('cache-control', 'public, max-age=20')
				.send();
		};

		const cachedDataParsed = JSON.parse(cachedData);
		const encodedGtfsRtFeed = await encodeGtfsRtFeed(cachedDataParsed);

		return reply
			.code(HTTP_STATUS.OK)
			.header('cache-control', 'public, max-age=20')
			.type('application/octet-stream')
			.send(encodedGtfsRtFeed);
	}

	/**
	 * Returns an RSS feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getRssFeed(request: FastifyRequest, reply: FastifyReply<string>) {
		//

		const cachedData = await apiCache.get('hub:alerts:published:rss');

		if (!cachedData) {
			Logger.error('[hub/v1/alerts:getRssFeed()] No RSS feed found in cache. Returning empty message.');
			return reply
				.code(HTTP_STATUS.NO_CONTENT)
				.header('cache-control', 'public, max-age=20')
				.send();
		};

		return reply
			.code(HTTP_STATUS.OK)
			.header('cache-control', 'public, max-age=20')
			.type('application/rss+xml; charset=utf-8')
			.send(cachedData);
	}

	//
}
