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

	const toggleResult = await goDb.operation.alerts.toggleLockById(request.params.id);

	if (!toggleResult) return sendErrorApiResponse(reply, {
		error: 'Failed to toggle lock status for alert',
		status_code: '500',
	});

	return sendSuccessApiResponse(reply, toggleResult);
}
