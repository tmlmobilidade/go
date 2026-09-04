/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Retrieves all vehicles.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listVehiclesHandler(request: FastifyRequest, reply: FastifyReply<Vehicle[]>) {
	//

	//
	// Fetch all vehicles

	const allVehicles = await goDb.operation.vehicles.findMany();

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: allVehicles, error: null, statusCode: HTTP_STATUS.OK });

	//
}
