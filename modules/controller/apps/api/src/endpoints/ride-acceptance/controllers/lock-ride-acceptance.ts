/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/types';

/**
 * Locks a justification by ride ID
 */
export async function lockRideAcceptance(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const oldJustificationData = await goDb.operation.rideAcceptances.findOne({ ride_id: request.params.id });

	if (oldJustificationData.is_locked === request.body.is_locked) {
		return reply.send({
			data: oldJustificationData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	const updateResult = await goDb.operation.rideAcceptances.updateOne({ ride_id: request.params.id }, { is_locked: request.body.is_locked, updated_by: request.me._id });

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
