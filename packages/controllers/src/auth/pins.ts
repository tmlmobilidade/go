import type { User_UNSAFE } from '@tmlmobilidade/types';

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, users } from '@tmlmobilidade/interfaces';

/* * */

interface AllPinsAggregateResult {
	data: string[]
}

/* * */

export class PinsSharedController {
	//

	/**
	 * Returns every controller-module pin ID from all users (union, may include duplicates).
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const pipeline: AggregationPipeline<User_UNSAFE> = [
			{ $match: { 'pins.controller.0': { $exists: true } } },
			{ $unwind: '$pins.controller' },
			{ $group: { _id: null, data: { $push: '$pins.controller' } } },
		];

		const rows = await users.aggregate(pipeline);
		const data = (rows[0] as unknown as AllPinsAggregateResult | undefined)?.data ?? [];

		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns controller ride IDs pinned by the authenticated user.
	 */
	static async getMine(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
		reply.send({ data: user.pins.controller, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Appends a controller ride ID to the authenticated user's pins (deduped).
	 */
	static async saveMine(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
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
	 */
	static async removeMine(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
		const { rideId } = request.body;
		if (!rideId?.trim()) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'rideId is required');

		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const controller = user.pins.controller.filter(id => id !== rideId.trim());
		await users.updateById(request.me._id, { pins: { controller } });

		reply.send({ data: controller, error: null, statusCode: HTTP_STATUS.OK });
	}
}
