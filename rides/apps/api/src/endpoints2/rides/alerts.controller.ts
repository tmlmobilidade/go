/* * */

import { fetchLines } from '@/utils/lines';
import { parseServiceAlert } from '@/utils/service-alert-parser';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { type Alert } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export class AlertsController {
	static async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const alertData = request.body as Alert;

			const result = await alerts.insertOne(alertData);

			reply.send({ data: { ...result, created_by: request.me._id, updated_by: request.me._id }, message: 'Alert created' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async delete(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			await alerts.deleteById(id);

			reply.send({ message: `Alert with id: ${id} deleted` });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async deleteImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
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

			reply.send({
				message: 'Image deleted',
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await alerts.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const alert = await alerts.findById(id);

			if (!alert) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}

			reply.send(alert);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async getGtfs(request: FastifyRequest, reply: FastifyReply) {
		try {
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
			}, undefined, undefined, { created_at: -1 });

			const lines = await fetchLines();
			const serviceAlerts = await Promise.all(result.map(async alert => await parseServiceAlert(alert, lines)));

			reply.send({
				entity: serviceAlerts,
				header: {
					gtfs_realtime_version: '2.0',
					incrementality: 'FULL_DATASET',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			});
		}
		catch (error) {
			reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
		}
	}

	static async getImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const { id } = request.params;

			const alert = await alerts.findById(id);

			if (!alert) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}

			const url = await files.getFileUrl({ file_id: alert.file_id });

			reply.send({
				data: url,
				message: 'Image retrieved',
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			const alertData = request.body as Partial<Alert>;

			await alerts.updateById(id, alertData);

			reply.send({
				data: { ...alertData, updated_by: request.me._id },
				message: `Alert with id: ${id} updated`,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async uploadImage(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const { id } = request.params;
			console.debug(`[uploadImage] Received request to upload image for alert id: ${id}`);

			const alert = await alerts.findById(id);
			console.debug(`[uploadImage] Fetched alert:`, alert);

			if (!alert) {
				console.debug(`[uploadImage] Alert not found for id: ${id}`);
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Alert not found' });
				return;
			}
			// Parse the file from the request
			const data = await request.file();
			console.debug(`[uploadImage] Received file:`, {
				filename: data.filename,
				mimetype: data.mimetype,
			});
			const buffer = await data.toBuffer();
			const size = buffer.buffer.byteLength;
			console.debug(`[uploadImage] File size: ${size} bytes`);

			const result = await files.upload(buffer, {
				created_by: request.me._id,
				name: data.filename,
				resource_id: id,
				scope: 'alerts',
				size: size,
				type: data.mimetype,
				updated_by: request.me._id,
			});
			console.debug(`[uploadImage] Uploaded file result:`, result);

			// Delete the old image if it exists
			try {
				if (alert.file_id) {
					console.debug(`[uploadImage] Deleting old file with id: ${alert.file_id}`);
					await files.deleteById(alert.file_id);
					console.debug(`[uploadImage] Old file deleted`);
				}
			}
			catch (error) {
				console.error(`[uploadImage] Error deleting old file:`, error);
			}

			await alerts.updateById(id, { file_id: result.insertedId.toString() });
			console.debug(`[uploadImage] Updated alert with new file_id: ${result.insertedId.toString()}`);

			reply.send({
				data: result,
				message: 'Image uploaded',
			});
		}
		catch (error) {
			console.error(`[uploadImage] Error:`, error);
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
