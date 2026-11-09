/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/go-types-operation';

/**
 * Changes the status of a ride acceptance by ride ID
 */
export async function changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const oldRideAcceptanceData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldRideAcceptanceData) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, {
		...oldRideAcceptanceData,
		acceptance_status: request.body.acceptance_status,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updateResult);
}
