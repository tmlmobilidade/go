/* * */

import { apiCache } from '@tmlmobilidade/databases';
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
		const singleItemTxt = await apiCache.get(`hub:network:shapes:${id}`);
		if (!singleItemTxt) return reply.code(404).send({});
		return reply
			.code(200)
			.header('cache-control', 'public, max-age=3600')
			.send(singleItemTxt);
	}
}
