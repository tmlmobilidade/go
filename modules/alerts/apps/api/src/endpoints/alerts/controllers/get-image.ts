/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment } from '@tmlmobilidade/types';

/**
 * Retrieves an alert image from storage.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function getImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	// Ensure the alert exists
	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	if (!foundAlert) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	}

	// Ensure the alert has an associated image file.
	// Since it is optional, return null if not present
	if (!foundAlert.file_id) {
		return reply.send({ data: null, error: null, statusCode: HTTP_STATUS.OK });
	}

	// Retrieve and send the image file
	const foundImageFile = await storageProvider.findById(foundAlert.file_id);
	if (!foundImageFile) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Image file not found');
	}

	reply.send({ data: foundImageFile, error: null, statusCode: HTTP_STATUS.OK });
}
