/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert, type UpdateAlertDto } from '@tmlmobilidade/go-types-operation';

/**
 * Updates an Alert in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAlertHandler(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
	//

	//
	// Validate the request body

	const updatedAlertData = await goDb.operation.alerts.updateById(request.params.id, {
		...request.body,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updatedAlertData);
}
