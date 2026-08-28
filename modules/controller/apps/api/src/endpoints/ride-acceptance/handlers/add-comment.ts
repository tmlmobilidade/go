/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';

/**
 * Adds a comment to a ride acceptance by ride ID
 */
export async function addComment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const rideAcceptanceData = await goDb.operation.rideAcceptances.findOne({ _id: request.params.id });

	if (!rideAcceptanceData) {
		return reply.status(HTTP_STATUS.NOT_FOUND).send({
			data: null,
			error: 'Ride acceptance not found.',
			statusCode: HTTP_STATUS.NOT_FOUND,
		});
	}

	const updateResult = await goDb.operation.rideAcceptances.updateById(
		request.params.id,
		{ ...rideAcceptanceData, comments: [...rideAcceptanceData.comments, { ...request.body, created_by: request.me._id, updated_by: request.me._id }], updated_by: request.me._id },
	);

	return reply.send({
		data: updateResult,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
