/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AlertCause, type RideAcceptance, RideJustificationSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { isDeepStrictEqual } from 'node:util';

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

	const audit = { created_at: now, created_by: userId, type: 'field_changed' as const, updated_at: now, updated_by: userId };
	const previousStatus = oldJustificationData.acceptance_status;
	const previousJustification = oldJustificationData.justification ?? null;
	const comments: RideAcceptance['comments'] = [];
	const hasRecordedJustification = oldJustificationData.comments?.some((comment) => {
		if (comment.type !== 'field_changed') return false;
		const changes = comment.field === 'multiple_fields' ? comment.metadata?.changes ?? [] : [comment];
		return changes.some(change => change.field === 'justification' && isDeepStrictEqual(change.curr_value, previousJustification));
	});
	if (previousJustification && !hasRecordedJustification) {
		comments.push({
			created_at: previousJustification.created_at,
			created_by: previousJustification.created_by,
			curr_value: previousJustification,
			field: 'justification',
			type: 'field_changed',
			updated_at: previousJustification.updated_at,
			updated_by: previousJustification.updated_by,
		});
	}
	if (previousStatus !== 'under_review') {
		comments.push({ ...audit, curr_value: 'under_review', field: 'acceptance_status', prev_value: previousStatus });
	}
	comments.push({ ...audit, curr_value: justification.data, field: 'justification' });

	const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
	const updateResult = await rideAcceptances.findOneAndUpdate(
		{ _id: request.params.id, acceptance_status: previousStatus, justification: previousJustification },
		{
			$push: { comments: { $each: comments } },
			$set: { acceptance_status: 'under_review', justification: justification.data, updated_at: now, updated_by: userId },
		},
		{ returnDocument: 'after' },
	);
	if (!updateResult) {
		return sendErrorApiResponse(reply, { error: 'The ride acceptance changed. Refresh and try again.', status_code: '409' });
	}

	return sendSuccessApiResponse(reply, updateResult);
}
