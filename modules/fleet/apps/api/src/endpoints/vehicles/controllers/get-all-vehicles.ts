/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { type Vehicle } from '@tmlmobilidade/types';

/**
 * Retrieves all vehicles.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getAllVehicles(request: FastifyRequest, reply: FastifyReply<Vehicle[]>) {
	//

	//
	// Fetch all vehicles

	const allVehicles = await vehicles.findMany({}, { sort: { created_at: -1 } });

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: allVehicles, error: null, statusCode: HTTP_STATUS.OK });

	//
}
