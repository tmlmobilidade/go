import { type FastifyReply, type FastifyRequest } from '@go/connectors-fastify';
import { stops } from '@go/interfaces';
import { HttpException, HttpStatus } from '@go/lib';
import { Stop, UpdateStopDto } from '@go/types';

/**
 * This is an example controller that is using the stops interface.
 */
export class StopsController {
	/**
	 * Creates a new stop
	 * @param request Fastify request containing stop data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<Stop>) {
		const data = request.body as Stop;
		const result = await stops.insertOne(data);

		reply.send({ data: result, error: null, statusCode: HttpStatus.CREATED });
	}

	/**
	 * Deletes an stop by ID
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		await stops.deleteById(id);

		reply.send({ data: null, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
		const data = await stops.findMany({}, {
			sort: { created_at: -1 },
		});

		reply.send({ data, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves a single stop by ID
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Stop>) {
		const { id } = request.params;
		const stop = await stops.findById(id);

		if (!stop) throw new HttpException(HttpStatus.NOT_FOUND, 'Stop not found');

		reply.send({ data: stop, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Updates an existing stop by ID
	 * @param request Fastify request containing stop ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateStopDto, Params: { id: string } }>, reply: FastifyReply<Stop>) {
		const { id } = request.params;
		const data = await stops.updateById(id, request.body);

		reply.send({ data, error: null, statusCode: HttpStatus.OK });
	}
}
