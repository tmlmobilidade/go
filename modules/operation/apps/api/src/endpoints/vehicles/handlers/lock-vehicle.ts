/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Toggles the lock status of a vehicle by ID.
 * @param request Fastify request containing vehicle ID in params.
 * @param reply Fastify reply.
 */
export async function lockVehicleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	//

	const foundVehicle = await goDb.operation.vehicles.findById(request.params.id);

	if (!foundVehicle) {
		return sendErrorApiResponse(reply, {
			error: 'Vehicle not found',
			status_code: '404',
		});
	}

	const updateResult = await goDb.operation.vehicles.updateOne({ _id: request.params.id }, { is_locked: !foundVehicle.is_locked });

	if (!updateResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to toggle lock status for vehicle',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, updateResult);
}
