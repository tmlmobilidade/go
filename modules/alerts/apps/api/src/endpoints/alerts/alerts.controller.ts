/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { type RssRawImageInput } from '@tmlmobilidade/rss';
import { createRssFeed } from '@tmlmobilidade/rss';
import { type Alert, CreateAlertDto, type File, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';

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
		// await notifications.sendNotification(PermissionCatalog.all.alerts.scope, 'created_alert', request.me, insertResult._id, insertResult.title, insertResult.description);
		reply.send({ data: insertResult, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
	}

	/**
	 * Deletes a scheduled Alert from the database.
	 * @param request The request object containing the alert ID in the params.
	 * @param reply The reply object.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await alerts.deleteById(request.params.id);
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
		if (!foundAlert) return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Alert not found' });
		if (!foundAlert.file_id) return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Image not found' });
		console.log('===> Found alert with image ID:', foundAlert.file_id);
		// Delete the image file and update the alert
		// await files.deleteById(foundAlert.file_id);
		console.log('===> Deleted image file ID:', foundAlert.file_id);
		await alerts.updateById(request.params.id, { file_id: null });
		// Send the updated Alert to the client
		const updatedAlert = await alerts.findById(request.params.id);
		if (!updatedAlert) return reply.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Alert not found' });
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns all Alerts sorted by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
		const allAlerts = await alerts.findMany();
		// Send the alerts to the client
		reply.send({ data: allAlerts, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Alert by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
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
		if (!foundAlert) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
		// Ensure the alert has an associated image file.
		// Since it is optional, return null if not present
		if (!foundAlert.file_id) return reply.send({ data: null, error: null, statusCode: HTTP_STATUS.OK });
		// Retrieve and send the image file
		const foundImageFile = await files.findById(foundAlert.file_id);
		if (!foundImageFile) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		return reply.send({ data: foundImageFile, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns active published alerts as RSS feed XML.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getRssFeed(_request: FastifyRequest, reply: FastifyReply<string>) {
		const alertsPublicListUrl = 'https://www.carrismetropolitana.pt/alerts'; // TODO: Replace with alerts public page
		const allAlerts = await AlertsController.fetchAlerts();

		if (!allAlerts.length) {
			reply.status(HTTP_STATUS.NOT_FOUND).send('No alerts available.');
			return;
		}

		const xmlItems = await Promise.all(allAlerts.map(async (alert) => {
			const images: RssRawImageInput[] = [];
			const fileIdOrder: string[] = [];
			const seen = new Set<string>();

			const attachedFiles = await files.findMany(
				{ resource_id: alert._id, scope: 'alerts' },
				{ sort: { created_at: 1 } },
			);

			if (alert.file_id) {
				fileIdOrder.push(alert.file_id);
				seen.add(alert.file_id);
			}

			for (const f of attachedFiles) {
				if (!seen.has(f._id)) {
					fileIdOrder.push(f._id);
					seen.add(f._id);
				}
			}

			for (const fileId of fileIdOrder) {
				try {
					const file = await files.findById(fileId);
					if (!file?.url) continue;
					images.push({
						alt: alert.title,
						type: file.type ?? null,
						url: file.url,
					});
				} catch {
					// Ignore errors
				}
			}

			return {
				description: alert.description,
				images: images.length ? images : [],
				link: `${alertsPublicListUrl}/${alert._id}`,
				linkLabel: 'Ver o alerta completo em carrismetropolitana.pt',
				publish_start_date: alert.publish_start_date,
				title: alert.title,
			};
		}));

		const xml = createRssFeed(xmlItems, {
			copyright: 'Carris Metropolitana',
			description: 'Alertas e atualizacoes da Carris Metropolitana.',
			feedSelfUrl: `${alertsPublicListUrl}.rss`,
			link: alertsPublicListUrl,
			title: 'Carris Metropolitana - Alertas',
		});

		reply.type('application/rss+xml; charset=utf-8').send(xml);
	}

	/**
	 * Toggles the lock status of an alert by ID.
	 * @param request Fastify request containing alert ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
		await alerts.toggleLockById(request.params.id);
		const foundAlert = await alerts.findById(request.params.id);
		if (!foundAlert) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
		reply.send({ data: foundAlert, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an Alert in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
		// Validate the request body
		const validatedAlert = UpdateAlertSchema.safeParse(request.body);
		if (!validatedAlert.success) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Dados inválidos', validatedAlert.error);
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
		if (!foundAlert) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
		// Extract the file data from the request
		const fileData = await request.file();
		if (!fileData) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'No file uploaded');
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
			} catch (error) {
				console.error(error);
			}
		}
		// Update the alert with the new file ID
		await alerts.updateById(foundAlert._id, { file_id: fileUploadResult._id.toString() });
		reply.send({ data: fileUploadResult, error: null, statusCode: HTTP_STATUS.OK });
	}

	private static async fetchAlerts() {
		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		return await alerts.findMany(
			{
				$and: [
					{
						$or: [
							{ publish_end_date: { $gte: now } },
							{ publish_end_date: null },
							{ publish_end_date: { $exists: false } },
						],
					},
					{ publish_start_date: { $lte: now } },
					{ publish_status: 'published' },
				],
			},
			{ sort: { publish_start_date: -1 } },
		);
	}

	//
}
