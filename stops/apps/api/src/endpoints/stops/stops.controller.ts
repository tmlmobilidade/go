/* eslint-disable @typescript-eslint/no-extraneous-class */

import { files, stops } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { Stop } from '@tmlmobilidade/types';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This is an example controller that is using the stops interface.
 */
export class StopsController {
	/**
     * Creates a new stop
     * @param request Fastify request containing stop data in body
     * @param reply Fastify reply
     */
	static async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const stopData = request.body as Stop;

			// const { comments, ...validStopData } = stopData;
			const result = await stops.insertOne(stopData);

			reply.send({ data: result, message: 'Stop created' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
     * Deletes an stop by ID
     * @param request Fastify request containing stop ID in params
     * @param reply Fastify reply
     */
	static async delete(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			await stops.deleteById(id);

			reply.send({ message: `Stop with id: ${id} deleted` });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async deleteImage(request: FastifyRequest<{ Params: { file_id: string, id: string } }>, reply: FastifyReply) {
		try {
			const { file_id, id } = request.params;

			const stop = await stops.findById(id);

			if (!stop) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Stop not found' });
				return;
			}

			if (!stop.image_ids.includes(file_id)) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
				return;
			}

			await files.deleteById(file_id);
			await stops.updateById(id, { image_ids: stop.image_ids.splice(stop.image_ids.indexOf(file_id), 1) });

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

	/**
     * Retrieves all stops, sorted by creation date descending
     * @param request Fastify request
     * @param reply Fastify reply
     */
	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await stops.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
     * Retrieves a single stop by ID
     * @param request Fastify request containing stop ID in params
     * @param reply Fastify reply
     */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const stop = await stops.findById(id);

			if (!stop) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Stop not found' });
				return;
			}

			reply.send(stop);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	static async getImage(request: FastifyRequest<{ Params: { id: string, imageId: string } }>, reply: FastifyReply) {
		try {
			const { id, imageId } = request.params;

			const stop = await stops.findById(id);

			if (!stop) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Stop not found' });
				return;
			}

			if (stop.image_ids.indexOf(imageId) == -1) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
				return;
			}

			const url = await files.getFileUrl({ file_id: imageId });

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

	static async getImages(request: FastifyRequest<{ Params: { id: string, imageId: string } }>, reply: FastifyReply) {
		try {
			const { id, imageId } = request.params;

			const stop = await stops.findById(id);

			if (!stop) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Stop not found' });
				return;
			}

			// if (stop.image_ids.indexOf(imageId) == -1) {
			// 	reply.status(HttpStatus.NOT_FOUND).send({ message: 'Image not found' });
			// 	return;
			// }

			const urls = await Promise.all(stop.image_ids.map(image_id => files.getFileUrl({ file_id: image_id })));

			reply.send({
				data: urls,
				message: 'Images retrieved',
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
     * Updates an existing stop by ID
     * @param request Fastify request containing stop ID in params and update data in body
     * @param reply Fastify reply
     */
	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			const stopData = request.body as Partial<Stop>;
			// const stopData = request.body as Partial<Stop>;

			await stops.updateById(id, stopData);

			reply.send({
				data: stopData,
				message: `Stop with id: ${id} updated`,
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

			const stop = await stops.findById(id);

			if (!stop) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Stop not found' });
				return;
			}
			// Parse the file from the request
			const data = await request.file();
			const buffer = await data.toBuffer();
			const size = buffer.buffer.byteLength;

			const result = await files.upload(buffer, {
				created_by: 'system', // TODO: Change to user id
				name: data.filename,
				resource_id: id,
				scope: 'stops',
				size: size,
				type: data.mimetype,
				updated_by: 'system', // TODO: Change to user id
			}, {});

			// Image ID to array of Image IDs
			stop.image_ids.push(result.insertedId.toString());
			await stops.updateById(id, { image_ids: stop.image_ids });

			reply.send({
				data: result,
				message: 'Image uploaded',
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
