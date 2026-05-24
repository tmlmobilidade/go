/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type HubLine } from '@tmlmobilidade/types';

/* * */

export class SchedulesController {
	//

	/**
	 * Retrieves all lines from cache.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getLines(request: FastifyRequest, reply: FastifyReply<HubLine[]>) {
		//

		const cachedData = await apiCache.get('hub:network:lines');

		if (!cachedData) {
			Logger.error('[hub/v1/schedules:getLines()] No cached data found for lines');
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
