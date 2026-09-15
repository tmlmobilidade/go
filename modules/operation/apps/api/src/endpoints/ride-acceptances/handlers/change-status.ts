/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Changes the status of a ride acceptance by ride ID
 * @param request Fastify request containing ride ID in params and the new status in body
 * @param reply Fastify reply
 */
export async function changeStatusHandler(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	//
	// Get the Ride Acceptance from the database

	const oldRideAcceptanceData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldRideAcceptanceData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride acceptance not found.',
			status_code: '404',
		});
	}

	//
	// Validate the updated document

	const validatedRideAcceptance = UpdateRideAcceptanceSchema.safeParse({
		...oldRideAcceptanceData,
		acceptance_status: request.body.acceptance_status,
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
