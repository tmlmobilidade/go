/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Toggles the lock status of an alert by ID.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function lockAlertHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	//

	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });

	if (!foundAlert) {
		return sendErrorApiResponse(reply, {
			error: 'Alert not found',
			status_code: '404',
		});
	}

	const updateResult = await goDb.operation.alerts.updateOne({ _id: request.params.id }, { is_locked: !foundAlert.is_locked });

	if (!updateResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to toggle lock status for alert',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, updateResult);
}
