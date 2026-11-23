/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Adds a comment to a ride acceptance by ride ID
 */
export async function addComment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const message = request.body?.message;
	if (typeof message !== 'string') {
		return sendErrorApiResponse(reply, { error: 'Invalid comment message.', status_code: '400' });
	}

	const now = Dates.now('utc').unix_milliseconds;
	const userId = request.me._id;
	const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
	const updateResult = await rideAcceptances.findOneAndUpdate(
		{ _id: request.params.id },
		{
			$push: { comments: { created_at: now, created_by: userId, message, type: 'note', updated_at: now, updated_by: userId } },
			$set: { updated_at: now, updated_by: userId },
		},
		{ returnDocument: 'after' },
	);

	if (!updateResult) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, updateResult);
}
