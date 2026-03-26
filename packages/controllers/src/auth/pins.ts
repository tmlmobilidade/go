import type { User_UNSAFE } from '@tmlmobilidade/types';

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, users } from '@tmlmobilidade/interfaces';

/* * */

export class PinsSharedController {
	//

	/**
	 * Returns controller ride IDs pinned by the authenticated user.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getMineControllerPins(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const pipeline = [
			{ $match: { _id: { $eq: request.me._id } } },
			{ $project: { _id: 0, controller: { $ifNull: ['$pins.controller', []] } } },
		] as unknown as AggregationPipeline<User_UNSAFE>;

		const rows = await users.aggregate(pipeline);
		const row = rows[0] as undefined | { controller?: unknown };
		if (!row) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const raw = row.controller;
		const data = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];

		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Appends a controller ride ID to the authenticated user's pins (deduped).
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async saveMineControllerPins(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
		const { rideId } = request.body;
		if (!rideId?.trim()) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'rideId is required');

		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const controller = [...new Set([...user.pins.controller, rideId.trim()])];
		await users.updateById(request.me._id, { pins: { controller } });

		reply.send({ data: controller, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Removes a controller ride ID from the authenticated user's pins.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async removeMineControllerPins(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
		const { rideId } = request.body;
		if (!rideId?.trim()) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'rideId is required');

		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const controller = user.pins.controller.filter(id => id !== rideId.trim());
		await users.updateById(request.me._id, { pins: { controller } });

		reply.send({ data: controller, error: null, statusCode: HTTP_STATUS.OK });
	}
}
