/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Retrieves a single vehicle by ID
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function getVehicleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	//

	//
	// Get the Vehicle from the database

	const vehicleData = await goDb.operation.vehicles.findById(request.params.id);

	if (!vehicleData) {
		return sendErrorApiResponse(reply, {
			error: 'Vehicle not found',
			status_code: '404',
		});
	}

	//
	// Send the vehicle data back to the client

	reply.header('Access-Control-Allow-Origin', '*');

	return sendSuccessApiResponse(reply, vehicleData);
}
