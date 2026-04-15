/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { generateStopId } from '@tmlmobilidade/go-stops-pckg-id-engine';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop, type StopId, type UpdateStopDto } from '@tmlmobilidade/types';

/**
 * This is an example controller that is using the stops interface.
 */
export class StopsController {
	//

	/**
	 * Creates a new Stop
	 * @param request Fastify request containing stop data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<Stop>) {
		const data = request.body as Stop;
		const newStopId = await generateStopId();
		const result = await stops.insertOne({ ...data, _id: newStopId }, { unsafe: true });
		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Toggles the deleted status of a stop by ID.
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		await stops.toggleDeleteById(request.params.id);
		const foundStop = await stops.findById(request.params.id);
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');
		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
		const data = await stops.findMany({}, { sort: { created_at: -1 } });
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAllIds(request: FastifyRequest, reply: FastifyReply<StopId[]>) {
		const data = await stops.findMany({}, { projection: { _id: 1 }, sort: { _id: 1 } });
		const ids = data.map(stop => stop._id);
		reply.send({ data: ids, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		const foundStop = await stops.findById(request.params.id);
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');
		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		await stops.toggleLockById(request.params.id);
		const foundStop = await stops.findById(request.params.id);
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');
		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing stop by ID
	 * @param request Fastify request containing stop ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateStopDto, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		const data = await stops.updateById(request.params.id, request.body);
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
