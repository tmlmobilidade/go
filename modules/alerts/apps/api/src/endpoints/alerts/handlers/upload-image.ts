/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment } from '@tmlmobilidade/go-types-core';

/**
 * Uploads an alert image to the database
 * @param request The request object containing the alert ID in the params and the image file in the body.
 * @param reply The reply object.
 */
export async function uploadImageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	// Retrieve the alert from the database
	const foundAlert = await goDb.operation.alerts.findById(request.params.id);
	if (!foundAlert) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	}

	// Extract the file data from the request
	const fileData = await request.file();
	if (!fileData) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file data found');
	}

	const buffer = await fileData.toBuffer();
	const size = buffer.buffer.byteLength;
	// Upload the file to the database
	const fileUploadResult = await storageProvider.upload(buffer, {
		created_by: request.me._id,
		name: fileData.filename,
		resource_id: foundAlert._id,
		scope: 'alerts',
		size: size,
		type: fileData.mimetype,
		updated_by: request.me._id,
	});

	// If the file upload result is not found, return an error
	if (!fileUploadResult) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to upload image');
	}

	// Delete the old image if it exists
	if (foundAlert.file_id) {
		await storageProvider.delete(foundAlert.file_id);
	}
	// Update the alert with the new file ID
	await goDb.operation.alerts.updateOne({ _id: foundAlert._id }, { file_id: fileUploadResult._id.toString() });
	reply.send({ data: fileUploadResult, error: null, statusCode: HTTP_STATUS.OK });
}
