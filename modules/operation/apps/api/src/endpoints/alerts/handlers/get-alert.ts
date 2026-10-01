/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Returns an Alert by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getAlertHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	//

	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });

	if (!foundAlert) {
		return sendErrorApiResponse(reply, {
			error: 'Alert not found for the given ID',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundAlert);
}
