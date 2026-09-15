/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment } from '@tmlmobilidade/go-types-core';

/**
 * Retrieves an alert image from storage.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function getImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment | null>) {
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
	// Ensure the alert has an associated image file.
	// Since it is optional, return null if not present

	if (!foundAlert.file_id) {
		return sendSuccessApiResponse(reply, null);
	}

	//
	// Retrieve and send the image file

	const foundImageFile = await storageProvider.findById(foundAlert.file_id);

	if (!foundImageFile) {
		return sendErrorApiResponse(reply, {
			error: 'Image file not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundImageFile);
}
