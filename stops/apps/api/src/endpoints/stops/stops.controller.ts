import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { stops } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { Stop } from '@tmlmobilidade/types';

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
			const data = request.body as Stop;

			const result = await stops.insertOne(data);

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

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await stops.findMany({}, 5, 1, { created_at: -1 }));
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
}
