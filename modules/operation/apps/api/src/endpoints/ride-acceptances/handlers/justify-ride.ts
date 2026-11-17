/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AlertCause, type RideAcceptance, RideJustificationSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Justifies a ride acceptance by ride ID
 */
export async function justifyRide(request: FastifyRequest<{ Body: { justification_cause: AlertCause, manual_trip_id?: string, pto_message: string }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const oldJustificationData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldJustificationData) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	const now = Dates.now('utc').unix_milliseconds;
	const userId = request.me._id;
	const justification = RideJustificationSchema.safeParse({
		created_at: now,
		created_by: userId,
		justification_cause: request.body?.justification_cause,
		justification_source: 'manual',
		manual_trip_id: request.body?.manual_trip_id,
		pto_message: request.body?.pto_message,
		updated_at: now,
		updated_by: userId,
	});
	if (!justification.success) {
		return sendErrorApiResponse(reply, { error: justification.error.message, status_code: '400' });
	}

	const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
	const updateResult = await rideAcceptances.findOneAndUpdate(
		{ _id: request.params.id },
		{
			$push: { comments: {
				created_at: now,
				created_by: userId,
				curr_value: justification.data,
				field: 'justification',
				prev_value: oldJustificationData.justification ?? null,
				type: 'field_changed',
				updated_at: now,
				updated_by: userId,
			} },
			$set: { acceptance_status: 'under_review', justification: justification.data, updated_at: now, updated_by: userId },
		},
		{ returnDocument: 'after' },
	);
	if (!updateResult) {
		return sendErrorApiResponse(reply, { error: 'Ride acceptance not found.', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, updateResult);
}
