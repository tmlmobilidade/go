/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Agency } from '@tmlmobilidade/types';

/* * */

export class AgenciesSharedController {
	//

	/**
	 * Returns all Agencies sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
		const allAgencies = await agencies.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allAgencies, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const agencyData = await agencies.findById(request.params.id);
		if (!agencyData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'agencies',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: agencyData, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
