/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, UpdateRideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';

/**
 * Adds a comment to a ride acceptance by ride ID
 * @param request Fastify request containing ride ID in params and the comment in body
 * @param reply Fastify reply
 */
export async function addCommentHandler(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	//
	// Get the Ride Acceptance from the database

	const rideAcceptanceData = await goDb.operation.rideAcceptances.findOne({ _id: request.params.id });

	if (!rideAcceptanceData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride acceptance not found.',
			status_code: '404',
		});
	}

	//
	// Validate the updated document

	const validatedRideAcceptance = UpdateRideAcceptanceSchema.safeParse({
		...rideAcceptanceData,
		comments: [...rideAcceptanceData.comments, { ...request.body, created_by: request.me._id, updated_by: request.me._id }],
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
