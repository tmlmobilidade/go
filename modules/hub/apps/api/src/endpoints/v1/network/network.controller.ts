/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type HubLine } from '@tmlmobilidade/types';

/* * */

export class NetworkController {
	//

	/**
	 * Retrieves all lines from cache.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getStops(request: FastifyRequest, reply: FastifyReply<HubLine[]>) {
		//

		const cachedData = await apiCache.get('hub:network:stops');

		if (!cachedData) {
			Logger.error('[hub/v1/network:getStops()] No cached data found for stops');
			return reply
				.header('cache-control', 'public, max-age=60')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Retrieves all routes from cache.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getRoutes(request: FastifyRequest, reply: FastifyReply<HubLine[]>) {
		//

		const cachedData = await apiCache.get('hub:network:routes');

		if (!cachedData) {
			Logger.error('[hub/v1/network:getRoutes()] No cached data found for routes');
			return reply
				.header('cache-control', 'public, max-age=60')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Retrieves all lines from cache.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getLines(request: FastifyRequest, reply: FastifyReply<HubLine[]>) {
		//

		const cachedData = await apiCache.get('hub:network:lines');

		if (!cachedData) {
			Logger.error('[hub/v1/network:getLines()] No cached data found for lines');
			return reply
				.header('cache-control', 'public, max-age=60')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Retrieves all lines from cache.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getPatterns(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubLine[]>) {
		//

		const cachedData = await apiCache.get(`hub:network:patterns:${request.params.id}`);

		if (!cachedData) {
			Logger.error(`[hub/v1/network:getPatterns(${request.params.id})] No cached data found for pattern ${request.params.id}`);
			return reply
				.header('cache-control', 'public, max-age=60')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	//
}
