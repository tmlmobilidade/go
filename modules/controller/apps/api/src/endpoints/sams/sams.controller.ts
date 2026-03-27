/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams } from '@tmlmobilidade/interfaces';
import { type Sam } from '@tmlmobilidade/types';

/* * */

export class SamsController {
	/**
     * Retrieves all Sams.
     * @param _request The request object.
     * @param reply The reply object.
     */
	static async getAll(_request: FastifyRequest, reply: FastifyReply<Sam[]>) {
		//
		// Fetch all Sams
		const allSams = await sams.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allSams, error: null, statusCode: HTTP_STATUS.OK });
	}
}
