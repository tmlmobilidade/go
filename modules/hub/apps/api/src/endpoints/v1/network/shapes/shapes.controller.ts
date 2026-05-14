/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

interface RequestSchema {
	Params: {
		id: string
	}
}

/* * */

export class ShapesController {
	static async getShapeById(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		const id = request.params.id;
		const cacheKey = 'hub:network:shapes:{shapeId}:json';
		const singleItemTxt = await readThroughHubJson(cacheKey, SERVERDB_KEYS.NETWORK.SHAPES.ID(id), `hub/v1/network/shapes:getShapeById(${id})`, { shapeId: id });
		if (!singleItemTxt) return reply.code(404).send({});
		return reply
			.code(200)
			.header('cache-control', 'public, max-age=3600')
			.send(singleItemTxt);
	}
}
