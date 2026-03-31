import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { users } from '@tmlmobilidade/interfaces';

/* * */

export class PinsSharedController {
	//

	/**
	 * Returns controller ride IDs pinned by the authenticated user.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getMineControllerPins(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const user = await users.findById(request.me._id);
		if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

		const preferenceControllerPins = user.preferences?.['ride-pins']?.['controller'];
		const legacyControllerPins = user.pins?.controller;

		const data = Array.isArray(preferenceControllerPins)
			? preferenceControllerPins.filter((id): id is string => typeof id === 'string')
			: Array.isArray(legacyControllerPins)
				? legacyControllerPins.filter((id): id is string => typeof id === 'string')
				: [];

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
