import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams } from '@tmlmobilidade/interfaces';
import { type Sam } from '@tmlmobilidade/types';

/* * */

export class SamsController {
	static async getAll(request: FastifyRequest, reply: FastifyReply<Sam[]>) {
		try {
			const allSams = await sams.findMany({}, { sort: { created_at: -1 } });

			//
			// Send the sam data back to the client

			reply.send({ data: allSams, error: null, statusCode: HTTP_STATUS.OK });

			//
		} catch (error) {
			reply.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
		}
	}
}
