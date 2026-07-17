/* * */

import { fetchMotisJson, type MotisQuery } from '@/endpoints/v1/motis/motis-client.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/**
 * Proxies a route planning request to MOTIS.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPlan(request: FastifyRequest<{ Querystring: MotisQuery }>, reply: FastifyReply<unknown>) {
	const data = await fetchMotisJson<unknown>('/api/v6/plan', request.query);

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'no-store')
		.code(HTTP_STATUS.OK)
		.send({
			data,
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
