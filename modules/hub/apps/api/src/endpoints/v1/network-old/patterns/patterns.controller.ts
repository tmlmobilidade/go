/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

interface RequestSchema {
	Params: {
		id: string
	}
}

/* * */

export class PatternsController {
	static async getPatternById(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		const id = request.params.id;
		const payload = await apiCache.get(`hub:network:patterns:${id}`);
		if (!payload) {
			Logger.error(`[hub/v1/network/patterns:getPatternById(${id})] No JSON in cache or SERVERDB.`);
			return reply
				.header('cache-control', 'public, max-age=20')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		}

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=3600')
			.send(JSON.parse(payload));
	}
}
