/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AlertCause, type RideAcceptance, RideAcceptanceStatusSchema, UpdateRideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Justifies a ride acceptance by ride ID
 * @param request Fastify request containing ride ID in params and the justification in body
 * @param reply Fastify reply
 */
export async function justifyRideHandler(request: FastifyRequest<{ Body: { justification_cause: AlertCause, manual_trip_id?: string, pto_message: string }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	//
	// Get the Ride Acceptance from the database

	const oldJustificationData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldJustificationData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride acceptance not found.',
			status_code: '404',
		});
	}

	//
	// Validate the updated document

	const validatedRideAcceptance = UpdateRideAcceptanceSchema.safeParse({
		...oldJustificationData,
		acceptance_status: RideAcceptanceStatusSchema.Values.under_review,
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
