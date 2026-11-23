/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Locks a justification by ride ID
 */
export async function lockRideAcceptance(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const isLocked = request.body?.is_locked;
	if (typeof isLocked !== 'boolean') {
		return sendErrorApiResponse(reply, { error: 'Invalid ride acceptance lock status.', status_code: '400' });
	}
	const acceptance = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!acceptance) {
		return sendErrorApiResponse(reply, {
			error: 'Ride Acceptance not found',
			status_code: '404',
		});
	}

	const wasLocked = acceptance.is_locked === true;
	if (wasLocked === isLocked) {
		return sendSuccessApiResponse(reply, acceptance);
	}

	const now = Dates.now('utc').unix_milliseconds;
	const userId = request.me._id;
	const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
	const updateResult = await rideAcceptances.findOneAndUpdate(
		{ _id: request.params.id, is_locked: wasLocked ? true : { $ne: true } },
		{
			$push: { comments: {
				created_at: now,
				created_by: userId,
				curr_value: isLocked,
				field: 'is_locked',
				prev_value: wasLocked,
				type: 'field_changed',
				updated_at: now,
				updated_by: userId,
			} },
			$set: { is_locked: isLocked, updated_at: now, updated_by: userId },
		},
		{ returnDocument: 'after' },
	);
	if (!updateResult) {
		return sendErrorApiResponse(reply, { error: 'The ride acceptance lock status changed. Refresh and try again.', status_code: '409' });
	}

	return sendSuccessApiResponse(reply, updateResult);
}
