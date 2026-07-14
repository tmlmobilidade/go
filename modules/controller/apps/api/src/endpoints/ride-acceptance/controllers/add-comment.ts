/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { type NoteComment, type RideAcceptance } from '@tmlmobilidade/types';

/**
 * Adds a comment to a ride acceptance by ride ID
 */
export async function addComment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const rideAcceptanceData = await goDB.operation.rideAcceptances.findByRideId(request.params.id);

	if (!rideAcceptanceData) {
		return reply.status(HTTP_STATUS.NOT_FOUND).send({
			data: null,
			error: 'Ride acceptance not found.',
			statusCode: HTTP_STATUS.NOT_FOUND,
		});
	}

	const updateResult = await goDB.operation.rideAcceptances.updateByRideId(
		request.params.id,
		{ comments: [...rideAcceptanceData.comments, { ...request.body, created_by: request.me._id, updated_by: request.me._id }], updated_by: request.me._id },
	);

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
