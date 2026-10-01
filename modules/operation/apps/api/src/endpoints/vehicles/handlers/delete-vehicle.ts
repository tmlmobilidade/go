/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a Vehicle by ID.
 * @param request The request object containing the vehicle ID in the params.
 * @param reply The reply object.
 */
export async function deleteVehicleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Delete the vehicle from the database

	const deleteResult = await goDb.operation.vehicles.deleteById(request.params.id);

	if (!deleteResult.deletedCount) {
		return sendErrorApiResponse(reply, {
			error: `Vehicle with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, undefined);
}
