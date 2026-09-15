/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a scheduled Alert image from the database.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function deleteImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Ensure the alert exists

	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });

	if (!foundAlert) {
		return sendErrorApiResponse(reply, {
			error: 'Alert not found',
			status_code: '404',
		});
	}

	//
	// Ensure the alert has an associated image file

	if (!foundAlert.file_id) {
		return sendErrorApiResponse(reply, {
			error: 'Image not found for alert',
			status_code: '404',
		});
	}

	//
	// Unset the image reference on the alert

	await goDb.operation.alerts.updateById(request.params.id, { file_id: null });

	//
	// Ensure the alert still exists after the update

	const updatedAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });

	if (!updatedAlert) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to delete image for alert',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, undefined);
}
