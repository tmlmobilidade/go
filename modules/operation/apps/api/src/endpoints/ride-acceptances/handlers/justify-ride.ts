/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AlertCause, type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
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

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, {
		...oldJustificationData,
		acceptance_status: RideAcceptanceStatusSchema.enum.under_review,
		justification: {
			created_at: Dates.now('utc').unix_milliseconds,
			created_by: request.me._id,
			justification_cause: request.body.justification_cause,
			justification_source: 'manual',
			manual_trip_id: request.body.manual_trip_id,
			pto_message: request.body.pto_message,
			updated_at: Dates.now('utc').unix_milliseconds,
			updated_by: request.me._id,
		},
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updateResult);
}
