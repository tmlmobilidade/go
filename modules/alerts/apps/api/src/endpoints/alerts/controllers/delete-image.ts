/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Deletes a scheduled Alert image from the database.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	console.log('===> Deleting image for alert ID:', request.params.id);
	// Ensure the alert exists and has an image
	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	// If the alert does not exist, return an error
	if (!foundAlert) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	}

	// Ensure the alert has an associated image file.
	if (!foundAlert.file_id) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Image not found for alert');
	}

	Logger.info({ message: `===> Found alert with image ID: ${foundAlert.file_id}` });
	// Delete the image file and update the alert
	// await files.deleteById(foundAlert.file_id);
	Logger.info({ message: `===> Deleted image file ID: ${foundAlert.file_id}` });
	await goDb.operation.alerts.updateOne({ _id: request.params.id }, { file_id: null });
	// Send the updated Alert to the client
	const updatedAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	// If the updated alert does not exist, return an error
	if (!updatedAlert) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete image for alert');
	}

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
