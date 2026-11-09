/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/go-types-operation';

/**
 * Locks a justification by ride ID
 */
export async function lockRideAcceptance(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const oldJustificationData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldJustificationData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride Acceptance not found',
			status_code: '404',
		});
	}

	if (oldJustificationData.is_locked === request.body.is_locked) {
		return sendSuccessApiResponse(reply, oldJustificationData);
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, {
		...oldJustificationData,
		is_locked: request.body.is_locked,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updateResult);
}
