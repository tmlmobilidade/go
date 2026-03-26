import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { users } from '@tmlmobilidade/interfaces';

/* * */

export class PinsSharedController {
	//

	/**
	 * Returns controller ride IDs pinned by the authenticated user.
	 */
	static async getMinePins(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
		reply.send({ data: user.pins.controller, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Appends a controller ride ID to the authenticated user's pins (deduped).
	 */
	static async saveMinePins(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
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
	static async removeMinePins(request: FastifyRequest<{ Body: { rideId: string } }>, reply: FastifyReply<string[]>) {
		const { rideId } = request.body;
		if (!rideId?.trim()) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'rideId is required');

		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const controller = user.pins.controller.filter(id => id !== rideId.trim());
		await users.updateById(request.me._id, { pins: { controller } });

		reply.send({ data: controller, error: null, statusCode: HTTP_STATUS.OK });
	}
}
