/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
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
		const cacheKey = 'hub:network:patterns:{patternId}:json';
		const payload = await readThroughHubJson(cacheKey, SERVERDB_KEYS.NETWORK.PATTERNS.ID(id), `hub/v1/network/patterns:getPatternById(${id})`, { patternId: id });
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
