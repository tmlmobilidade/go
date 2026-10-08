/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Returns a Vehicle by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getVehicleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	//

	//
	// Get the vehicle data

	const foundVehicle = await goDb.operation.vehicles.findById(request.params.id);

	if (!foundVehicle) {
		return sendErrorApiResponse(reply, {
			error: `Vehicle with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundVehicle);
}
