/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { describeAlert, type DescribeAlertProps, type DescribeAlertReturnType } from '@tmlmobilidade/go-alerts-pckg-describe';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type CreateAlertDto, CreateAlertSchema, type File, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';

/* * */

export class AlertsController {
	//

	/**
	 * Insert a new scheduled Alert into the database.
	 * @param request The request object containing the alert data in the body.
	 * @param reply The reply object.
	 */
	static async create(request: FastifyRequest<{ Body: CreateAlertDto }>, reply: FastifyReply<Alert>) {
		const insertResult = await alerts.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		if (!insertResult) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create alert');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'alerts',
				request,
				value: request.body,
			});
			throw error;
		}

		// await notifications.sendNotification(PermissionCatalog.all.alerts.scope, 'created_alert', request.me, insertResult._id, insertResult.title, insertResult.description);
		reply.send({ data: insertResult, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
	}

	/**
	 * Deletes a scheduled Alert from the database.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const deleteResult = await alerts.deleteById(request.params.id);
		if (!deleteResult) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete alert');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Deletes a scheduled Alert image from the database.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		console.log('===> Deleting image for alert ID:', request.params.id);
		// Ensure the alert exists and has an image
		const foundAlert = await alerts.findById(request.params.id);
		// If the alert does not exist, return an error
		if (!foundAlert) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete image for alert');
			Logger.issue('error', error, {
				action: 'deleteImage',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		// Ensure the alert has an associated image file.
		if (!foundAlert.file_id) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete image for alert');
			Logger.issue('error', error, {
				action: 'deleteImage',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		Logger.info('===> Found alert with image ID:', foundAlert.file_id);
		// Delete the image file and update the alert
		// await files.deleteById(foundAlert.file_id);
		Logger.info('===> Deleted image file ID:', foundAlert.file_id);
		await alerts.updateById(request.params.id, { file_id: null });
		// Send the updated Alert to the client
		const updatedAlert = await alerts.findById(request.params.id);
		// If the updated alert does not exist, return an error
		if (!updatedAlert) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete image for alert');
			Logger.issue('error', error, {
				action: 'deleteImage',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns all Alerts sorted by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
		// Retrieve permissions for the current user
		const userReadPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read);

		// Setup a query filter based on permissions
		const permissionsQuery = userReadPermissions.resources?.agency_ids?.includes(PermissionCatalog.ALLOW_ALL_FLAG)
			// If user has access to all agencies, no filter is applied
			? {}
			// Otherwise, filter by the allowed agency IDs
			: { agency_id: { $in: userReadPermissions.resources?.agency_ids ?? [] } };
		// Retrieve and send all alerts
		const allAlerts = await alerts.findMany({ ...permissionsQuery }, { sort: { active_period_start_date: -1 } });

		// Send the alerts to the client
		reply.send({ data: allAlerts, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Alert by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		//

		const foundAlert = await alerts.findById(request.params.id);
		// If the alert does not exist, return an error
		if (!foundAlert) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
			Logger.error(error, {
				action: 'getById',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundAlert, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves an alert image from storage.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async getImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		// Ensure the alert exists
		const foundAlert = await alerts.findById(request.params.id);

		// Ensure the alert has an associated image file.
		// Since it is optional, return null if not present
		if (!foundAlert.file_id) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
			Logger.issue('error', error, {
				action: 'getImage',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}
		// Retrieve and send the image file
		const foundImageFile = await files.findById(foundAlert.file_id);
		if (!foundImageFile) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Image file not found');
			Logger.issue('error', error, {
				action: 'getImage',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundImageFile, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of an alert by ID.
	 * @param request Fastify request containing alert ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		await alerts.toggleLockById(request.params.id);
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'alerts',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundAlert, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Describes an alert by ID.
	 * @param request Fastify request containing alert ID in params.
	 * @param reply Fastify reply.
	 */
	static async describe(request: FastifyRequest<{ Body: DescribeAlertProps }>, reply: FastifyReply<DescribeAlertReturnType>) {
		const describeResult = await describeAlert(request.body);

		reply.send({ data: describeResult, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Duplicates an alert by ID.
	 * @param request Fastify request containing alert ID in params.
	 * @param reply Fastify reply.
	 */
	static async duplicate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		// Retrieve the existing alert
		const existingAlert = await alerts.findById(request.params.id);

		// Update necessary properties to indicate a copy
		const duplicatedAlertData = CreateAlertSchema.parse({
			...existingAlert,
			created_by: request.me._id,
			publish_status: 'draft',
			title: `${existingAlert.title} (Cópia)`,
			updated_by: request.me._id,
		});
		// Insert the duplicated alert into the database
		// and send the duplicated alert to the client
		const insertResult = await alerts.insertOne(duplicatedAlertData);

		reply.send({ data: insertResult, error: null, statusCode: HTTP_STATUS.OK });

		Logger.issue('info', 'Duplicated alert', {
			action: 'duplicate',
			feature: 'alerts',
			request,
			value: request.params.id,
		});
	}

	/**
	 * Updates an Alert in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
		// Validate the request body
		const validatedAlert = UpdateAlertSchema.safeParse(request.body);

		// Update the alert in the database
		const updatedAlertData = await alerts.updateById(request.params.id, validatedAlert.data);

		reply.send({ data: updatedAlertData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Uploads an alert image to the database
	 * @param request The request object containing the alert ID in the params and the image file in the body.
	 * @param reply The reply object.
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		// Retrieve the alert from the database
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
			Logger.issue('error', error, {
				action: 'uploadImage',
				feature: 'alerts',
				request,
			});
			throw error;
		}

		// Extract the file data from the request
		const fileData = await request.file();
		if (!fileData) {
			const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file data found');
			Logger.issue('error', error, {
				action: 'uploadImage',
				feature: 'alerts',
				request,
			});
			throw error;
		}

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

		// If the file upload result is not found, return an error
		if (!fileUploadResult) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to upload image');
			Logger.issue('error', error, {
				action: 'uploadImage',
				feature: 'alerts',
				request,
			});
			throw error;
		}

		// Delete the old image if it exists
		if (foundAlert.file_id) {
			await files.deleteById(foundAlert.file_id);
		}
		// Update the alert with the new file ID
		await alerts.updateById(foundAlert._id, { file_id: fileUploadResult._id.toString() });
		reply.send({ data: fileUploadResult, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
