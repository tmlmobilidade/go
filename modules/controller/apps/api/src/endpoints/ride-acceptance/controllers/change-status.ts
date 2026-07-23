/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/types';

/**
 * Changes the status of a ride acceptance by ride ID
 */
export async function changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const updateResult = await goDb.operation.rideAcceptances.updateOne({ ride_id: request.params.id }, {
		acceptance_status: request.body.acceptance_status,
		updated_by: request.me._id,
	});

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
