import { plans } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { Plan } from '@tmlmobilidade/types';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This is an example controller that is using the plans interface.
 */
export class PlansController {
	/**
	 * Creates a new plan
	 * @param request Fastify request containing plan data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const data = request.body as Plan;

			const result = await plans.insertOne(data);

			reply.send({ data: result, message: 'Plan created' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Deletes an plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async delete(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			await plans.deleteById(id);

			reply.send({ message: `Plan with id: ${id} deleted` });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves all plans, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			reply.send(await plans.findMany({}, undefined, undefined, { created_at: -1 }));
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Retrieves a single plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;

			const plan = await plans.findById(id);

			if (!plan) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Plan not found' });
				return;
			}

			reply.send(plan);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Updates an existing plan by ID
	 * @param request Fastify request containing plan ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		try {
			const { id } = request.params;
			const planData = request.body as Partial<Plan>;

			await plans.updateById(id, planData);

			reply.send({
				data: planData,
				message: `Plan with id: ${id} updated`,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
