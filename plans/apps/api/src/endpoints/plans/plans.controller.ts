import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { files, plans, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpStatus, mimeTypes, Permissions } from '@tmlmobilidade/lib';
import { CreateFileDto, CreatePlanDto, Permission, Plan, PlanPermission, PlanSchema } from '@tmlmobilidade/types';
import { convertObject, hasAPIResourcePermission } from '@tmlmobilidade/utils';
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
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Plan not found' });
				return;
			}

			//

			//
			// Check if the user has permission to create a plan
			if (!hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.create,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: validation.gtfs_agency.agency_id,
			})) {
				reply.status(HttpStatus.FORBIDDEN).send({ message: 'You are not authorized to perform this action' });
				return;
			}

			//

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
			const plan = await plans.findById(id);

			if (!plan) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Plan not found' });
				return;
			}

			//

			//
			// Check if the user has permission to create a plan
			if (!hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.delete,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: plan.gtfs_agency.agency_id,
			})) {
				reply.status(HttpStatus.FORBIDDEN).send({ message: 'You are not authorized to perform this action' });
				return;
			}

			//

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
			const permissions = request.permissions as Permission<PlanPermission>;

			// Filter plans by all keys
			console.log('======= permissions ========', permissions);
			if (permissions?.resource) {
				const filter = {
					...(permissions.resource.agency_ids && !permissions.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: permissions.resource.agency_ids } }),
					...(permissions.resource.end_date && { 'gtfs_feed_info.feed_end_date': { $lte: permissions.resource.end_date } }),
					...(permissions.resource.start_date && { 'gtfs_feed_info.feed_start_date': { $gte: permissions.resource.start_date } }),
				};

				console.log('======= filter ========', filter);

				const filteredPlans = await plans.findMany(
					filter,
					undefined,
					undefined,
					{ created_at: -1 },
				);

				console.log('======= filteredPlans ========', filteredPlans);

				return reply.send(filteredPlans);
			}

			// Send all plans
			return reply.send(await plans.findMany({}, undefined, undefined, { created_at: -1 }));
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

			//

			//
			// Check if the user has permission to create a plan
			if (!hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.read,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: plan.gtfs_agency.agency_id,
			})) {
				reply.status(HttpStatus.FORBIDDEN).send({ message: 'You are not authorized to perform this action' });
				return;
			}

			//

			try {
				const file = await files.findById(plan.operation_file_id);
				return reply.send({
					...plan,
					file,
				});
			}
			catch (error) {
				return reply.send({
					...plan,
					file: undefined,
				});
			}
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
			const update_data = request.body as Partial<Plan>;

			const plan = await plans.findById(id);

			//

			//
			// Check if the user has permission to create a plan
			if (!hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.update,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: plan.gtfs_agency.agency_id,
			})) {
				reply.status(HttpStatus.FORBIDDEN).send({ message: 'You are not authorized to perform this action' });
				return;
			}

			//

			if (!plan) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Plan not found' });
				return;
			}

			const plan_dates = {
				feed_end_date: plan.gtfs_feed_info?.feed_end_date,
				feed_start_date: plan.gtfs_feed_info?.feed_start_date,
			};
			const update_dates = {
				feed_end_date: update_data.gtfs_feed_info?.feed_end_date,
				feed_start_date: update_data.gtfs_feed_info?.feed_start_date,
			};

			// Check if feed dates are being updated
			if (update_dates.feed_start_date || update_dates.feed_end_date) {
				// Only update file if dates actually changed
				if (update_dates.feed_start_date !== plan_dates.feed_start_date || update_dates.feed_end_date !== plan_dates.feed_end_date) {
					// Update feed info dates in file
					const { file, info } = await updateFeedInfoDates(
						plan.operation_file_id,
						update_dates.feed_start_date, // Use new dates instead of old ones
						update_dates.feed_end_date,
					);

					// Prepare file metadata
					const file_data: CreateFileDto = {
						created_by: info.created_by,
						name: info.name,
						resource_id: info.resource_id,
						scope: info.scope,
						size: file.size,
						type: mimeTypes.zip,
						updated_by: 'system',
					};

					// Upload updated file and store new file ID
					const file_result = await files.upload(
						Buffer.from(await file.arrayBuffer()),
						file_data,
					);
					update_data.operation_file_id = file_result.insertedId.toString();
				}
			}

			await plans.updateById(id, update_data);

			reply.send({
				data: update_data,
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
