/* * */

import { fetchMotisJson } from '@/endpoints/v1/motis/motis-client.js';
import { type MotisQuery } from '@/endpoints/v1/motis/motis.types.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/**
 * Proxies a geocoding request to MOTIS.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGeocode(request: FastifyRequest<{ Querystring: MotisQuery }>, reply: FastifyReply<unknown>) {
	const data = await fetchMotisJson<unknown>('/api/v1/geocode', request.query);

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
