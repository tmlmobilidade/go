import { MultipartValue } from '@fastify/multipart';
import { files, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { CreatePlanDto, OperationalDate, Plan } from '@tmlmobilidade/types';
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
			const data = await request.file();

			if (!data) {
				reply.status(HttpStatus.BAD_REQUEST).send({ message: 'No file provided' });
				return;
			}

			const fields = data.fields as Record<string, MultipartValue>;

			// Convert form fields to plan data
			const planData: CreatePlanDto = {
				agency_id: fields.agency_id?.value as string,
				feeder_status: fields.feeder_status?.value as 'error' | 'processing' | 'success' | 'waiting',
				is_approved: fields.is_approved?.value === 'true',
				is_locked: fields.is_locked?.value === 'true',
				valid_from: fields.valid_from?.value as OperationalDate,
				valid_until: fields.valid_until?.value as OperationalDate,
			};

			const buffer = await data.toBuffer();
			const size = buffer.buffer.byteLength;

			const transactionManager = new TransactionManager([plans, files]);

			// Start transaction
			const result = await transactionManager.withTransaction(async (collections, transactions) => {
				const [plansCollection, filesCollection] = collections;

				// Get the appropriate transaction for each collection
				const plansTransaction = transactions.get(plansCollection);
				const filesTransaction = transactions.get(filesCollection);

				// 1. Create the plan
				const planResult = await plansCollection.insertOne(planData, { options: { session: plansTransaction.getSession() } });

				// 2. Upload the operation plan file
				const fileResult = await (filesCollection as typeof files).upload(buffer, {
					created_by: 'system', // TODO: Change to user id
					name: data.filename,
					resource_id: planResult.insertedId.toString(),
					scope: 'plans',
					size: size,
					type: data.mimetype,
					updated_by: 'system', // TODO: Change to user id
				}, { session: filesTransaction.getSession() });

				// 3. Update the plan with the file reference
				await plansCollection.updateById(planResult.insertedId.toString(), {
					operation_file: fileResult.insertedId.toString(),
				} as Partial<Plan>, { session: plansTransaction.getSession() });

				return {
					...planResult,
					file_id: fileResult.insertedId.toString(),
				};
			});

			reply.send({
				data: result,
				message: 'Plan created with operation plan file',
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
