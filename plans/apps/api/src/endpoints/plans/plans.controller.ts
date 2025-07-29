/* * */

import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { files, plans, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpException, HttpStatus, mimeTypes, Permissions } from '@tmlmobilidade/lib';
import { type CreateFileDto, type CreatePlanDto, File as FileType, type Permission, type Plan, type PlanPermission, ProcessingStatus } from '@tmlmobilidade/types';
import { hasAPIResourcePermission } from '@tmlmobilidade/utils';

/* * */;

export class PlansController {
	/**
	 * Creates a new plan
	 * @param request Fastify request containing plan data and operation plan file in multipart form
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreatePlanDto }>, reply: FastifyReply<Plan>) {
		const { validation_id } = request.body;
		const validation = await validations.findById(validation_id);

		if (!validation) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');
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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		// Start transaction
		const transactionManager = new TransactionManager([plans, files] as const);

		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			const [plansCollection, filesCollection] = collections;

			// Get the appropriate transaction for each collection
			const plansTransaction = transactions.get(plansCollection);
			const filesTransaction = transactions.get(filesCollection);

			// 1. Create the plan
			const planResult = await plansCollection.insertOne(
				{
					gtfs_agency: validation.gtfs_agency,
					gtfs_feed_info: validation.gtfs_feed_info,
					hash: '',
					is_locked: false,
					operation_file_id: '',
					status_controller: ProcessingStatus.Waiting,
					status_merger: ProcessingStatus.Waiting,
				},
				{ options: { session: plansTransaction.getSession() } },
			);

			// 2. Upload the operation plan file
			const fileResult = await filesCollection.clone(
				validation.file_id,
				Permissions.plans.scope,
				planResult._id.toString(),
				{ session: filesTransaction.getSession() },
			);

			// 3. Update the plan with the file reference
			await plansCollection.updateById(planResult._id.toString(), { operation_file_id: fileResult?._id.toString() }, { session: plansTransaction.getSession() });

			// 4. Return the plan with the file reference
			const finalPlan = await plansCollection.findById(planResult._id.toString(), { session: plansTransaction.getSession() });

			return {
				...finalPlan,
				file_id: fileResult._id.toString(),
			};
		});

		reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Deletes an plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const plan = await plans.findById(id);

		if (!plan) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');
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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		await plans.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all plans, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
		const permissions = request.permissions as Permission<PlanPermission>;

		// Filter plans by all keys
		if (permissions?.resource) {
			const filter = {
				...(permissions.resource.agency_ids && !permissions.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: permissions.resource.agency_ids } }),
				...(permissions.resource.end_date && { 'gtfs_feed_info.feed_end_date': { $lte: permissions.resource.end_date } }),
				...(permissions.resource.start_date && { 'gtfs_feed_info.feed_start_date': { $gte: permissions.resource.start_date } }),
			};

			const filteredPlans = await plans.findMany(
				filter,
				{ sort: { created_at: -1 } },
			);

			return reply.send({ data: filteredPlans, error: null, statusCode: HttpStatus.OK });
		}

		// Send all plans
		const allPlans = await plans.findMany({}, { sort: { created_at: -1 } });
		return reply.send({ data: allPlans, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all plans that are approved together with the URL to the operation file
	 * This method is used to fetch plans that are ready for use in the system.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getApprovedPlans(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
		// Get all plans that are approved
		const allPlans = await plans.all();
		// For each plan, get the file URL
		const plansWithFiles = await Promise.all(
			allPlans.map(async (plan) => {
				const file = await files.findById(plan.operation_file_id);
				return { ...plan, operation_file_url: file.url };
			}),
		);

		// Send all plans
		return reply.send({ data: plansWithFiles, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves a single plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async getById(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<Plan & { file: FileType }>,
	) {
		const { id } = request.params;

		const plan = await plans.findById(id);

		if (!plan) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');
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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		try {
			const file = await files.findById(plan.operation_file_id);
			return reply.send({ data: { ...plan, file }, error: null, statusCode: HttpStatus.OK });
		}
		catch (error) {
			console.warn('Error fetching file for plan:', error);
			return reply.send({ data: { ...plan, file: undefined }, error: null, statusCode: HttpStatus.OK });
		}
	}

	/**
	 * Updates an existing plan by ID
	 * @param request Fastify request containing plan ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply<Plan>,
	) {
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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');
		}

		//

		if (!plan) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');
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
				update_data.operation_file_id = file_result._id.toString();
			}
		}

		const updatedPlan = await plans.updateById(id, update_data);

		reply.send({ data: updatedPlan, error: null, statusCode: HttpStatus.OK });
	}
}
