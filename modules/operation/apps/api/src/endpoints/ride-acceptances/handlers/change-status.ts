/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, type UpdateRideAcceptanceDto } from '@tmlmobilidade/go-types-operation';

/**
 * Changes the status of a ride acceptance by ride ID
 */
export async function changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//
	const oldRideAcceptanceData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!oldRideAcceptanceData) {
		return reply.status(HTTP_STATUS.NOT_FOUND).send({
			data: null,
			error: 'Ride acceptance not found.',
			statusCode: HTTP_STATUS.NOT_FOUND,
		});
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(request.params.id, {
		...oldRideAcceptanceData,
		acceptance_status: request.body.acceptance_status,
		updated_by: request.me._id,
	});

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
