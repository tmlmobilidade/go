import { files, plans, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { CreatePlanDto, Plan, PlanSchema } from '@tmlmobilidade/types';
import { convertObject } from '@tmlmobilidade/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * This is an example controller that is using the plans interface.
 */
export class PlansController {
	/**
	 * Creates a new plan
	 * @param request Fastify request containing plan data and operation plan file in multipart form
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply) {
		try {
			const { validation_id } = request.body as CreatePlanDto;

			const validation = await validations.findById(validation_id);

			if (!validation) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Validation not found' });
				return;
			}

			// Clone the validation to plan
			const plan: Plan = {
				...validation,
				is_approved: false,
				is_locked: false,
				operation_file_id: validation.file_id,
				validation_id: validation_id,
			};

			// Start transaction
			const transactionManager = new TransactionManager([plans, files]);

			const result = await transactionManager.withTransaction(async (collections, transactions) => {
				const [plansCollection, filesCollection] = collections;

				// Get the appropriate transaction for each collection
				const plansTransaction = transactions.get(plansCollection);
				const filesTransaction = transactions.get(filesCollection);

				// 1. Create the plan
				const planResult = await plansCollection.insertOne(
					convertObject(plan, PlanSchema.omit({ _id: true, created_at: true, updated_at: true })),
					{ options: { session: plansTransaction.getSession() } },
				);

				// 2. Upload the operation plan file
				const fileResult = await (filesCollection as typeof files).clone(
					validation.file_id,
					'plans',
					planResult.insertedId.toString(),
					{ session: filesTransaction.getSession() },
				);

				// 3. Update the plan with the file reference
				await plansCollection.updateById(planResult.insertedId.toString(), {
					operation_file_id: fileResult.insertedId.toString(),
				} as Partial<Plan>, { session: plansTransaction.getSession() });

				// 4. Return the plan with the file reference
				const finalPlan = await plansCollection.findById(planResult.insertedId.toString(), { session: plansTransaction.getSession() });

				return {
					...finalPlan,
					file_id: fileResult.insertedId.toString(),
				};
			});

			reply.send({
				...result,
			});
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

			const file = await files.findById(plan.operation_file_id);

			if (!file) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'File not found' });
				return;
			}

			file.url = await files.getFileUrl({ file_id: file._id });

			reply.send({
				...plan,
				file,
			});
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
