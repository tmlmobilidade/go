/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Locks a justification by ride ID
 * @param request Fastify request containing ride ID in params and the lock state in body
 * @param reply Fastify reply
 */
export async function lockRideAcceptanceHandler(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	//
	// Get the Ride Acceptance from the database

	const oldJustificationData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldJustificationData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride Acceptance not found',
			status_code: '404',
		});
	}

	//
	// Skip the update if the lock state is unchanged

	if (oldJustificationData.is_locked === request.body.is_locked) {
		return sendSuccessApiResponse(reply, oldJustificationData);
	}

	//
	// Validate the updated document

	const validatedRideAcceptance = UpdateRideAcceptanceSchema.safeParse({
		...oldJustificationData,
		is_locked: request.body.is_locked,
		updated_by: request.me._id,
	});

	if (!validatedRideAcceptance.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRideAcceptance.error.message,
			status_code: '400',
		});
	}

	//
	// Update the Ride Acceptance in the database

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, validatedRideAcceptance.data);

	return sendSuccessApiResponse(reply, updateResult);
}
