/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';

/**
 * Adds a comment to a ride acceptance by ride ID
 */
export async function addComment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const rideAcceptanceData = await goDb.operation.rideAcceptances.findOne({ _id: request.params.id });

	if (!rideAcceptanceData) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(
		request.params.id,
		{ ...rideAcceptanceData, comments: [...rideAcceptanceData.comments, { ...request.body, created_by: request.me._id, updated_by: request.me._id }], updated_by: request.me._id },
	);

	return sendSuccessApiResponse(reply, updateResult);
}
