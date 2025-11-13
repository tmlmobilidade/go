/* * */

import { fetchLines } from '@/utils/lines.js';
import { parseServiceAlert } from '@/utils/service-alert-parser.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { HttpException, HttpStatus, Permissions } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { alerts, files, notifications } from '@tmlmobilidade/interfaces';
import { type Alert, type File, GetAllAlertsQuery, GetAllAlertsQuerySchema, ServiceAlertResponse } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/* * */

export class AlertsController {
	/**
	 * Create a new alert - Inserts a new alert into the database
	 * @param {FastifyRequest} request - The request object containing the alert data in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async create(request: FastifyRequest<{ Body: Alert }>, reply: FastifyReply<Alert>) {
		const result = await alerts.insertOne(request.body);

		await notifications.sendNotification(Permissions.alerts.scope, Permissions.topics.actions.created_alert, request.me, result._id, result.title, result.description);

		reply.send({ data: result, error: null, statusCode: HttpStatus.CREATED }).status(HttpStatus.CREATED);
	}

	/**
	 * Delete an alert - Deletes an alert from the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		await alerts.deleteById(id);

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
	 * Get all alerts - Retrieves all alerts from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getAll(request: FastifyRequest<{ Querystring: GetAllAlertsQuery }>, reply: FastifyReply<Alert[]>) {
		const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
		const result = await alerts.findMany({ type: parsedQuery.realtime === true ? 'REALTIME' : 'PLANNED' }, { sort: { created_at: -1 } });

		reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get an alert by ID - Retrieves an alert from the database by its ID
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<Alert>,
	) {
		const { id } = request.params;

		const alert = await alerts.findById(id);

		if (!alert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');

		reply.send({ data: alert, error: null, statusCode: HttpStatus.OK });
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
		const { id } = request.params;

		const alert = await alerts.findById(id);

		if (!alert) throw new HttpException(HttpStatus.NOT_FOUND, 'Alert not found');

		const file = await files.findById(alert.file_id);

		if (!file) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		}

		reply.send({ data: file, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Update an alert - Updates an alert in the database
	 * @param {FastifyRequest} request - The request object containing the alert ID in the params and the alert data in the body
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<Alert>,
	) {
		const { id } = request.params;
		const alertData = request.body as Partial<Alert>;

		const alert = await alerts.updateById(id, alertData);

		reply.send({ data: alert, error: null, statusCode: HttpStatus.OK });
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
