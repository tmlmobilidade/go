/* * */

import { fetchLines } from '@/utils/lines.js';
import { parseServiceAlert } from '@/utils/service-alert-parser.js';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { alerts, files, notifications } from '@tmlmobilidade/interfaces';
import { type Alert, type File, PermissionCatalog, type ServiceAlertResponse, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';

/* * */

export class AlertsController {
	//

	/**
	 * Create a new alert - Inserts a new alert into the database
	 * @param {FastifyRequest} request - The request object containing the alert data in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async create(request: FastifyRequest<{ Body: Alert }>, reply: FastifyReply<Alert>) {
		const result = await alerts.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });

		await notifications.sendNotification(PermissionCatalog.all.alerts_scheduled.scope, 'created_alert', request.me, result._id, result.title, result.description);

		reply.send({ data: result, error: null, statusCode: HttpStatus.CREATED }).status(HttpStatus.CREATED);
	}

	/**
	 * Delete an alert - Deletes an alert from the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await alerts.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Delete an alert image - Deletes an alert image from the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;

		const alert = await alerts.findById(id);

		if (!alert) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
			return;
		}

		if (!alert.file_id) {
			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
			return;
		}

		await files.deleteById(alert.file_id);
		await alerts.updateById(id, { file_id: undefined });

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns all Alerts sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
		const allAlerts = await alerts.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allAlerts, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns an Alert by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		const alertData = await alerts.findById(request.params.id);
		if (!alertData) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
		reply.send({ data: alertData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get GTFS alerts - Retrieves GTFS alerts from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getGtfs(request: FastifyRequest, reply: FastifyReply<ServiceAlertResponse>) {
		const result = await alerts.findMany({
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
					publish_status: 'PUBLISHED',
				},
			],
		}, { sort: { created_at: -1 } });

		const lines = await fetchLines();
		const serviceAlerts = await Promise.all(result.map(async alert => await parseServiceAlert(alert, lines)));

		reply.send({
			data: {
				entity: serviceAlerts,
				header: { gtfs_realtime_version: '2.0', incrementality: 'FULL_DATASET', timestamp: Dates.now('Europe/Lisbon').unix_timestamp },
			},
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Get an alert image - Retrieves an alert image from the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');
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
	 * Upload an alert image - Uploads an alert image to the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params and the image file in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<File>) {
		const { id } = request.params;

		const alert = await alerts.findById(id);

		if (!alert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');

		const data = await request.file();

		if (!data) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');

		const buffer = await data.toBuffer();
		const size = buffer.buffer.byteLength;

		const result = await files.upload(buffer, {
			created_by: request.me._id,
			name: data.filename,
			resource_id: id,
			scope: 'alerts',
			size: size,
			type: data.mimetype,
			updated_by: request.me._id,
		});

		// Delete the old image if it exists
		if (alert.file_id) {
			try {
				await files.deleteById(alert.file_id);
			}
			catch (error) {
				console.error(error);
			}
		}

		await alerts.updateById(id, { file_id: result._id.toString() });

		reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}
}
