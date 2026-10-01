/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a scheduled Alert from the database.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function deleteAlertHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const deleteResult = await goDb.operation.alerts.deleteById(request.params.id);

	if (!deleteResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to delete alert for the given ID',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, undefined);
}
