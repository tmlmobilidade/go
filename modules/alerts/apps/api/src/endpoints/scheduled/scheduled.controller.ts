/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { alerts, files, notifications } from '@tmlmobilidade/interfaces';
import { type Alert, CreateAlertDto, type File, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';

/* * */

export class ScheduledController {
	//

	/**
	 * Insert a new scheduled Alert into the database.
	 * @param request The request object containing the alert data in the body.
	 * @param reply The reply object.
	 */
	static async create(request: FastifyRequest<{ Body: CreateAlertDto }>, reply: FastifyReply<Alert>) {
		const insertResult = await alerts.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		await notifications.sendNotification(PermissionCatalog.all.alerts_scheduled.scope, 'created_alert', request.me, insertResult._id, insertResult.title, insertResult.description);
		reply.send({ data: insertResult, error: null, statusCode: HttpStatus.CREATED }).status(HttpStatus.CREATED);
	}

	/**
	 * Deletes a scheduled Alert from the database.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await alerts.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Deletes a scheduled Alert image from the database.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		// Ensure the alert exists and has an image
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) return reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
		if (!foundAlert.file_id) return reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
		// Delete the image file and update the alert
		await files.deleteById(foundAlert.file_id);
		await alerts.updateById(request.params.id, { file_id: undefined });
		// Send the updated Alert to the client
		const updatedAlert = await alerts.findById(request.params.id);
		if (!updatedAlert) return reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns all Alerts sorted by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
		const allAlerts = await alerts.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allAlerts, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns an Alert by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
		reply.send({ data: foundAlert, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves an alert image from storage.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async getImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		// Ensure the alert exists
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
		// Ensure the alert has an associated image file.
		// Since it is optional, return null if not present
		if (!foundAlert.file_id) reply.send({ data: null, error: null, statusCode: HttpStatus.OK });
		// Retrieve and send the image file
		const foundImageFile = await files.findById(foundAlert.file_id);
		if (!foundImageFile) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		reply.send({ data: foundImageFile, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Toggles the lock status of an alert by ID.
	 * @param request Fastify request containing alert ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		await alerts.toggleLockById(request.params.id);
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
		reply.send({ data: foundAlert, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Updates an Alert in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
		// Validate the request body
		const validatedAlert = UpdateAlertSchema.safeParse(request.body);
		if (!validatedAlert.success) throw new HttpException(HttpStatus.BAD_REQUEST, 'Dados inválidos', validatedAlert.error);
		// Update the alert in the database
		const updatedAlertData = await alerts.updateById(request.params.id, validatedAlert.data);
		reply.send({ data: updatedAlertData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Uploads an alert image to the database
	 * @param request The request object containing the alert ID in the params and the image file in the body.
	 * @param reply The reply object.
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		// Retrieve the alert from the database
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
		// Extract the file data from the request
		const fileData = await request.file();
		if (!fileData) throw new HttpException(HttpStatus.BAD_REQUEST, 'No file uploaded');
		const buffer = await fileData.toBuffer();
		const size = buffer.buffer.byteLength;
		// Upload the file to the database
		const fileUploadResult = await files.upload(buffer, {
			created_by: request.me._id,
			name: fileData.filename,
			resource_id: foundAlert._id,
			scope: 'alerts',
			size: size,
			type: fileData.mimetype,
			updated_by: request.me._id,
		});
		// Delete the old image if it exists
		if (foundAlert.file_id) {
			try {
				await files.deleteById(foundAlert.file_id);
			}
			catch (error) {
				console.error(error);
			}
		}
		// Update the alert with the new file ID
		await alerts.updateById(foundAlert._id, { file_id: fileUploadResult._id.toString() });
		reply.send({ data: fileUploadResult, error: null, statusCode: HttpStatus.OK });
	}

	//
}
