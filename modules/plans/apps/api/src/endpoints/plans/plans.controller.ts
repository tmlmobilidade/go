/* * */

import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ALLOW_ALL_FLAG, HttpException, HttpStatus, mimeTypes, Permissions } from '@tmlmobilidade/consts';
import { files, gtfsValidations, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { type CreateFileDto, type CreatePlanDto, File as FileType, HashablePlanMetadata, type Permission, type Plan, type PlanPermission, type UpdatePlanDto, validateOperationalDate } from '@tmlmobilidade/types';
import { getPermission, hasAPIResourcePermission } from '@tmlmobilidade/utils';
import { createHash } from 'node:crypto';

/* * */;

export class PlansController {
	//

	/**
	 * Changes the GTFS of a plan by ID
	 * @param request Fastify request containing plan ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async changeGtfsPlan(request: FastifyRequest<{ Body: { validation_id: string }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//

		//
		// Check if the user has permission to change the GTFS of the Plan

		const hasPermissionChangeGtfsPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.update_gtfs_plan,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		//

		if (!hasPermissionChangeGtfsPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to change the GTFS of the plan.');

		//
		// For a given validation ID, get the validation data

		const validationData = await gtfsValidations.findById(request.body.validation_id);
		if (!validationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Validation not found');

		//
		// Change the GTFS of the plan

		const transactionManager = new TransactionManager([plans, files] as const);

		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			//

			//
			// Get the appropriate transaction for each collection

			const [plansCollection, filesCollection] = collections;

			const plansTransaction = transactions.get(plansCollection);
			const filesTransaction = transactions.get(filesCollection);

			//
			// Delete the old operation file

			files.deleteById(planData.operation_file_id, { session: filesTransaction.getSession() });

			//
			// Make a clone of the validation GTFS file in S3
			// to keep plan data separate from validations

			const updateFileResult = await filesCollection.clone(
				validationData.file_id,
				Permissions.plans.scope,
				planData._id.toString(),
				{ session: filesTransaction.getSession() },
			);

			//
			// Get a hash of all metadata to make it possible
			// to keep track of changes to the plan

			const hashablePlanMetadata: HashablePlanMetadata = {
				_id: planData._id,
				gtfs_agency: planData.gtfs_agency,
				gtfs_feed_info: planData.gtfs_feed_info,
				operation_file_id: updateFileResult._id,
			};

			const hashValue = createHash('sha256')
				.update(JSON.stringify(hashablePlanMetadata))
				.digest('hex');

			//
			// Update the plan with the new data

			const updatedPlanData = await plansCollection.updateById(planData._id, {
				hash: hashValue,
				operation_file_id: updateFileResult._id,
			}, { session: plansTransaction.getSession() });

			return updatedPlanData;
		});

		//
		// Send the updated plan data as the response

		reply.send({
			data: result,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

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

		const validationData = await gtfsValidations.findById(request.body.validation_id);

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
				pcgi_legacy: {
					operation_plan_id: '',
				},
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

		const planPermission: Permission<PlanPermission> = getPermission(request.permissions, Permissions.plans.scope, Permissions.plans.actions.read);

		//
		// Filter plans based on permissions for the current user

		if (planPermission?.resource) {
			const filter = {
				...(planPermission.resource.agency_ids && !planPermission.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: planPermission.resource.agency_ids } }),
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
	 * Retrieves the DRT model file
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getDrtModel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const file = await files.findById(`drt-model-${request.params.id}`);
		if (!file) throw new HttpException(HttpStatus.NOT_FOUND, 'DRT model file not found');

		// Redirect to the file download url
		return reply.redirect(file.url);
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
			action: Permissions.plans.actions.toggle_lock,
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

		let planData = await plans.findById(request.params.id);

		if (!planData) throw new HttpException(HttpStatus.NOT_FOUND, 'Plan not found');

		//
		// Check if the user has permission to update the Plan

		const hasPermissionReadPlan = hasAPIResourcePermission<PlanPermission>(request, {
			action: Permissions.plans.actions.update,
			resource_key: 'agency_ids',
			scope: Permissions.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update this plan.');

		//
		// Validate the new feed info dates

		const validatedFeedStartDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_start_date);
		const validatedFeedEndDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_end_date);

		if (validatedFeedStartDate > validatedFeedEndDate) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Feed start date cannot be after feed end date');
		}

		//
		// Check if the dates actually changed
		// to avoid unnecessary file updates

		if (planData.gtfs_feed_info.feed_start_date !== validatedFeedStartDate || planData.gtfs_feed_info.feed_end_date !== validatedFeedEndDate) {
			//

			//
			// Check if the user has permission to update the PCGI legacy field

			const hasPermissionUpdateFeedInfoDates = hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.update_feed_info_dates,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: planData.gtfs_agency.agency_id,
			});

			if (!hasPermissionUpdateFeedInfoDates) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update the feed info dates.');

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

			planData = await plans.updateById(planData._id, {
				gtfs_feed_info: {
					...planData.gtfs_feed_info,
					feed_end_date: validatedFeedEndDate,
					feed_start_date: validatedFeedStartDate,
				},
				hash: hashValue,
				operation_file_id: updateFileResult._id,
			});

			//
		}

		//
		// Check if the PCGI legacy field is being updated

		if (request.body.pcgi_legacy?.operation_plan_id && request.body.pcgi_legacy?.operation_plan_id !== planData.pcgi_legacy?.operation_plan_id) {
			//

			//
			// Check if the user has permission to update the PCGI legacy field

			const hasPermissionUpdatePcgiLegacy = hasAPIResourcePermission<PlanPermission>(request, {
				action: Permissions.plans.actions.update_pcgi_legacy,
				resource_key: 'agency_ids',
				scope: Permissions.plans.scope,
				value: planData.gtfs_agency.agency_id,
			});

			if (!hasPermissionUpdatePcgiLegacy) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update the PCGI legacy field.');

			//
			// Update the plan with the new data

			planData = await plans.updateById(planData._id, {
				pcgi_legacy: {
					operation_plan_id: request.body.pcgi_legacy.operation_plan_id,
				},
			});

			//
		}

		//
		// Send the updated plan data as the response

		reply.send({
			data: planData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
