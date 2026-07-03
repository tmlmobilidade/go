/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { rideAcceptances } from '@tmlmobilidade/interfaces';
import { type AlertCause, type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/types';

/**
 * Justifies a ride acceptance by ride ID
 */
export async function justifyRide(request: FastifyRequest<{ Body: { justification_cause: AlertCause, manual_trip_id?: string, pto_message: string }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const updateResult = await rideAcceptances.updateByRideId(request.params.id, {
		acceptance_status: RideAcceptanceStatusSchema.Values.under_review,
		justification: {
			created_at: Dates.now('utc').unix_timestamp,
			created_by: request.me._id,
			justification_cause: request.body.justification_cause,
			justification_source: 'MANUAL',
			manual_trip_id: request.body.manual_trip_id,
			pto_message: request.body.pto_message,
			updated_at: Dates.now('utc').unix_timestamp,
		},
		updated_by: request.me._id,
	});

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
