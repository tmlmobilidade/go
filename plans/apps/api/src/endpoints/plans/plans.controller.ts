/* * */

import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { files, plans, TransactionManager, validations } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpException, HttpStatus, mimeTypes, Permissions } from '@tmlmobilidade/lib';
import { type CreateFileDto, type CreatePlanDto, File as FileType, HashablePlanMetadata, type Permission, type Plan, type PlanPermission, type UpdatePlanDto, validateOperationalDate } from '@tmlmobilidade/types';
import { hasAPIResourcePermission } from '@tmlmobilidade/utils';
import { createHash } from 'node:crypto';

/* * */;

export class PlansController {
	//

	/**
	 * Reprocesses a plan by ID.
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async controllerReprocessPlanById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
		const planData = await plans.findById(request.params.id);
		const result = await plans.updateById(request.params.id, { controller: { ...planData.controller, last_hash: null, status: 'waiting' } });
		return reply.send({ data: result, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Creates a new plan from a validation ID.
	 * @param request Fastify request containing plan data and operation plan file in multipart form
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: { validation_id: string } }>, reply: FastifyReply<Plan>) {
		//

		//
		// For a given validation ID, create a new plan

		const validationData = await validations.findById(request.body.validation_id);

		if (!validationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Start a new MongoDB transaction to duplicate the plan,
		// copy the operation file, and update the plan with the new file reference

		const transactionManager = new TransactionManager([plans, files] as const);

		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			//

			//
			// Get the appropriate transaction for each collection

			const [plansCollection, filesCollection] = collections;

			const plansTransaction = transactions.get(plansCollection);
			const filesTransaction = transactions.get(filesCollection);

			//
			// Create a new plan object based on the validation data
			// and save it to the database

			const newPlanData: CreatePlanDto = {
				controller: {
					last_hash: null,
					status: 'waiting',
					timestamp: null,
				},
				gtfs_agency: validationData.gtfs_agency,
				gtfs_feed_info: validationData.gtfs_feed_info,
				hash: '',
				is_locked: false,
				operation_file_id: '',
				status_merger: 'waiting',
			};

			const planResult = await plansCollection.insertOne(
				newPlanData,
				{ options: { session: plansTransaction.getSession() } },
			);

			//
			// Make a clone of the validation GTFS file in S3
			// to keep plan data separate from validations

			const fileResult = await filesCollection.clone(
				validationData.file_id,
				Permissions.plans.scope,
				planResult._id.toString(),
				{ session: filesTransaction.getSession() },
			);

			//
			// Get a hash of all metadata to make it possible
			// to keep track of changes to the plan

			const hashablePlanMetadata: HashablePlanMetadata = {
				_id: planResult._id,
				gtfs_agency: planResult.gtfs_agency,
				gtfs_feed_info: planResult.gtfs_feed_info,
				operation_file_id: fileResult._id,
			};

			const hashValue = createHash('sha256')
				.update(JSON.stringify(hashablePlanMetadata))
				.digest('hex');

			//
			// Associate the cloned file and the hash to the plan object
			// and return it to the caller

			const finalPlanResult = await plansCollection.updateById(
				planResult._id,
				{ hash: hashValue, operation_file_id: fileResult._id },
				{ session: plansTransaction.getSession() },
			);

			return finalPlanResult;
		});

		//
		// Send the transaction result as the response

		reply.send({ data: result, error: null, statusCode: HttpStatus.OK });

		//
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
	 * Retrieves all plans.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
		//

		//
		// Extract permissions from the request

		const permissions = request.permissions as Permission<PlanPermission>;

		//
		// Filter plans based on permissions for the current user

		if (permissions?.resource) {
			const filter = {
				...(permissions.resource.agency_ids && !permissions.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: permissions.resource.agency_ids } }),
				...(permissions.resource.end_date && { 'gtfs_feed_info.feed_end_date': { $lte: permissions.resource.end_date } }),
				...(permissions.resource.start_date && { 'gtfs_feed_info.feed_start_date': { $gte: permissions.resource.start_date } }),
			};

			const filteredPlans = await plans.findMany(filter, { sort: { created_at: -1 } });

			return reply.send({ data: filteredPlans, error: null, statusCode: HttpStatus.OK });
		}

		//
		// If no specific permissions are set, return all plans

		const allPlans = await plans.all();

		return reply.send({ data: allPlans, error: null, statusCode: HttpStatus.OK });

		//
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
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.read,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');

		//
		// Fetch the plan data

		return reply.send({
			data: planData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Retrieves the operation file associated with a plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async getPlanOperationFileById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.read,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');

		//
		// Fetch the file associated with the plan

		const fileData = await files.findById(planData.operation_file_id);

		if (!fileData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan operation file not found');

		return reply.send({
			data: fileData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async toggleLockById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Check if the user has permission to toggle lock the Plan

		const hasPermissionToggleLockPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.update,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionToggleLockPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');

		//
		// Toggle the lock status of the plan

		const result = await plans.updateById(planData._id, { is_locked: !planData.is_locked });

		return reply.send({
			data: result,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Updates an existing plan by ID
	 * @param request Fastify request containing plan ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdatePlanDto, Params: { id: string } }>, reply: FastifyReply<Plan>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.update,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action');

		//
		// Validate the new feed info dates

		const validatedFeedStartDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_start_date);
		const validatedFeedEndDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_end_date);

		//
		// Update the feed info dates in the operation file

		const updateDatesResult = await updateFeedInfoDates(
			planData.operation_file_id,
			validatedFeedStartDate,
			validatedFeedEndDate,
		);

		//
		// Prepare the updated file metadata

		const updatedFileData: CreateFileDto = {
			created_by: updateDatesResult.info.created_by,
			name: updateDatesResult.info.name,
			resource_id: updateDatesResult.info.resource_id,
			scope: updateDatesResult.info.scope,
			size: updateDatesResult.file.size,
			type: mimeTypes.zip,
			updated_by: 'system',
		};

		//
		// Upload updated file and store new file ID

		const updateFileResult = await files.upload(
			Buffer.from(await updateDatesResult.file.arrayBuffer()),
			updatedFileData,
		);

		//
		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planData._id,
			gtfs_agency: planData.gtfs_agency,
			gtfs_feed_info: {
				...planData.gtfs_feed_info,
				feed_end_date: validatedFeedEndDate,
				feed_start_date: validatedFeedStartDate,
			},
			operation_file_id: updateFileResult._id,
		};

		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		//
		// Update the plan with the new data

		const updatedPlan = await plans.updateById(planData._id, {
			gtfs_feed_info: {
				...planData.gtfs_feed_info,
				feed_end_date: validatedFeedEndDate,
				feed_start_date: validatedFeedStartDate,
			},
			hash: hashValue,
			operation_file_id: updateFileResult._id,
		});

		reply.send({
			data: updatedPlan,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	//
}
