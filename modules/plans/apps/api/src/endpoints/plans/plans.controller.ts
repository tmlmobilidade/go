/* * */

import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { HTTP_STATUS, HttpException, mimeTypes } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, type Filter, gtfsValidations, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { type CreateFileDto, type CreatePlanDto, File as FileType, HashablePlanMetadata, PermissionCatalog, type Plan, type UpdatePlanDto, validateOperationalDate } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/* * */;

export class PlansController {
	//

	private static getAttachmentContentDisposition(filename: string): string {
		const quotedFilename = filename.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
		return `attachment; filename="${quotedFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
	}

	private static getPlanPostersFileId(planData: Plan): null | string {
		const postersWithLegacyFile = planData.apps.posters as Plan['apps']['posters'] & { file?: FileType | null };
		return planData.apps.posters.file_id ?? postersWithLegacyFile.file?._id ?? null;
	}

	private static getPlanPostersFilename(): string {
		return 'planos pdf.zip';
	}

	/**
	 * Lists the plans to generate posters.
	 * @param request Fastify request containing the plan ID
	 * @param reply Fastify reply
	 */
	static async listPlanToGeneratePosters(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<{ success: boolean }>) {
		//

		//
		// Get the plan data

		const planData = await plans.findById(request.params.id);

		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Get user permissions for the plan

		const userPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.generate_pdf_posters);

		if (!userPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to generate posters for this plan.');
		}

		//
		// Save status to the plan processing posters

		await plans.updateById(planData._id, {
			apps: {
				...planData.apps,
				posters: {
					file_id: null,
					job_id: null,
					last_hash: null,
					requested_by: request.me.email,
					status: 'waiting',
					step: null,
					timestamp: null,
				},
			},
		});

		//
		reply.send({ data: { success: true }, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Changes the GTFS of a plan by ID
	 * @param request Fastify request containing plan ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async changeGtfsPlan(request: FastifyRequest<{ Body: { validation_id: string }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);
		const originalFileId = planData.operation_file_id;
		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		// Check if the user has permission to change the GTFS of the Plan
		const hasPermissionChangeGtfsPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update_gtfs_plan,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		// Throw an error if the user is not authorized
		if (!hasPermissionChangeGtfsPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to change the GTFS of the plan.');
		}

		// For a given validation ID, get the validation data
		const validationData = await gtfsValidations.findById(request.body.validation_id);
		if (!validationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
		}

		// Create a new MongoDB transaction to manage the GTFS change
		// and perform all necessary operations atomically, with rollback on failure
		const transactionManager = new TransactionManager([plans, files] as const);

		// Execute the transaction and return the updated plan data
		const result = await transactionManager.withTransaction(async (collections, transactions) => {
			//

			// Get the appropriate transaction for each collection
			const [plansCollection, filesCollection] = collections;
			const plansTransaction = transactions.get(plansCollection);
			const filesTransaction = transactions.get(filesCollection);

			// Make a clone of the validation GTFS file in S3
			// to keep plan data separate from validations
			const updateFileResult = await filesCollection.clone(
				validationData.file_id,
				PermissionCatalog.all.plans.scope,
				planData._id.toString(),
				{ session: filesTransaction.getSession() },
			);

			// Get a hash of all metadata to make it possible
			// to keep track of changes to the plan
			const hashablePlanMetadata: HashablePlanMetadata = {
				_id: planData._id,
				gtfs_agency: planData.gtfs_agency,
				gtfs_feed_info: planData.gtfs_feed_info,
				operation_file_id: updateFileResult._id,
			};

			// Generate the hash value
			const hashValue = createHash('sha256')
				.update(JSON.stringify(hashablePlanMetadata))
				.digest('hex');

			// Update the plan with the new data
			const updatedPlanData = await plansCollection.updateById(
				planData._id,
				{ hash: hashValue, operation_file_id: updateFileResult._id },
				{ session: plansTransaction.getSession() },
			);

			// Return the updated plan data
			return updatedPlanData;
		});

		// Delete the old operation file
		await files.deleteById(originalFileId);

		// Send the updated plan data as the response
		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Reprocesses a plan by ID.
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async controllerReprocessPlanById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
		const planData = await plans.findById(request.params.id);
		const result = await plans.updateById(request.params.id, { apps: { ...planData.apps, controller: { last_hash: null, status: 'waiting', timestamp: null } } });
		return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
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

		if (!validationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

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
				apps: {
					controller: {
						last_hash: null,
						status: 'waiting',
						timestamp: null,
					},
					hub_gtfs: {
						last_hash: null,
						status: 'waiting',
						timestamp: null,
					},
					hub_schedules: {
						last_hash: null,
						status: 'waiting',
						timestamp: null,
					},
					merger: {
						last_hash: null,
						status: 'waiting',
						timestamp: null,
					},
					posters: {
						file_id: null,
						job_id: null,
						last_hash: null,
						status: 'skipped',
						step: null,
						timestamp: null,
					},
				},
				created_by: request.me._id,
				gtfs_agency: validationData.gtfs_agency,
				gtfs_feed_info: validationData.gtfs_feed_info,
				hash: '',
				is_locked: false,
				operation_file_id: '',
				pcgi_legacy: {
					operation_plan_id: '',
				},
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
				PermissionCatalog.all.plans.scope,
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

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });

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
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//

		//
		// Check if the user has permission to create a plan
		if (!PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: plan.gtfs_agency.agency_id,
		})) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: delete plan');
		}

		//

		await plans.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Download the operation file associated with a plan by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async downloadPlanOperationFileById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		// Get the Plan from the database
		const planData = await plans.findById(request.params.id);
		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		// Check if the user has permission to read the Plan
		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});
		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
		}

		// Fetch the file associated with the plan
		const foundFileData = await files.findById(planData.operation_file_id);
		if (!foundFileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan operation file not found');
		}

		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
		}

		// Set headers and pipe the response body to the client
		reply.header('Content-Disposition', PlansController.getAttachmentContentDisposition(foundFileData.name));
		reply.header('Content-Type', 'application/zip');
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	/**
	 * Retrieves all plans.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
		//

		//
		// Get the resource permissions for
		// GTFS Validations for the current user.

		const userPlanPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.read);

		//
		// If specific agency permissions are set,
		// setup the database filters accordingly.

		const queryFilters: Filter<Plan> = {};

		//
		// If agency IDs are specified and do not include the ALLOW_ALL_FLAG,
		// filter validations by those agency IDs.

		if ('resources' in userPlanPermissions && 'agency_ids' in userPlanPermissions.resources) {
			if (!userPlanPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters['gtfs_agency.agency_id'] = { $in: userPlanPermissions.resources['agency_ids'] };
			}
		}

		if ('resources' in userPlanPermissions) {
			const filters = {
				...(userPlanPermissions.resources['agency_ids'] && !userPlanPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: userPlanPermissions.resources['agency_ids'] } }),
			};

			const filteredPlans = await plans.findMany(filters, { sort: { created_at: -1 } });

			if (!filteredPlans) {
				throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plans not found');
			}

			return reply.send({ data: filteredPlans, error: null, statusCode: HTTP_STATUS.OK });
		}

		//
		// If no specific permissions are set, return all plans

		const allPlans = await plans.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allPlans, error: null, statusCode: HTTP_STATUS.OK });

		//
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

		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
		}

		//
		// Fetch the plan data

		return reply.send({
			data: planData,
			error: null,
			statusCode: HTTP_STATUS.OK,
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
		if (!file) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'DRT model file not found');
		}

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

		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
		}

		//
		// Fetch the file associated with the plan

		const fileData = await files.findById(planData.operation_file_id);

		if (!fileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan operation file not found');
		}

		return reply.send({
			data: fileData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Retrieves the generated posters file associated with a plan by ID
	 * @param request Fastify request containing plan ID in params
	 * @param reply Fastify reply
	 */
	static async getPlanPostersFileById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
		//

		//
		// Get the Plan from the database

		const planData = await plans.findById(request.params.id);

		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
		}

		//
		// Fetch the posters file associated with the plan

		const postersFileId = PlansController.getPlanPostersFileId(planData);

		if (!postersFileId) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan posters file not found');
		}

		const fileData = await files.findById(postersFileId);

		if (!fileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan posters file not found');
		}

		return reply.send({
			data: fileData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Download the generated posters file associated with a plan by ID.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async downloadPlanPostersFileById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		//

		//
		// Get the Plan from the database
		const planData = await plans.findById(request.params.id);
		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Check if the user has permission to read the Plan

		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');
		}

		//
		// Get the posters file ID

		const postersFileId = PlansController.getPlanPostersFileId(planData);

		if (!postersFileId) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan posters file not found');
		}

		//
		// Fetch the file associated with the plan

		const foundFileData = await files.findById(postersFileId);
		if (!foundFileData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan posters file not found');
		}

		//
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
		}

		//
		// Set headers and pipe the response body to the client

		reply.header('Content-Disposition', PlansController.getAttachmentContentDisposition(PlansController.getPlanPostersFilename()));
		reply.header('Content-Type', 'application/zip');

		//
		// Set content length if available

		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);

		//
		// Pipe the response body to the client

		return reply.send(storageServiceResponse.body);
	}

	/**
	 * Toggles the lock status of a plan by ID.
	 * @param request Fastify request containing plan ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
		// Get the Plan from the database
		const planData = await plans.findById(request.params.id);
		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		// Check if the user has permission to toggle lock the Plan
		const hasPermissionToggleLockPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});
		if (!hasPermissionToggleLockPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock plan');
		}

		// If authorized, toggle the lock status of the plan
		await plans.toggleLockById(request.params.id);
		const foundPlan = await plans.findById(request.params.id);
		if (!foundPlan) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		reply.send({ data: foundPlan, error: null, statusCode: HTTP_STATUS.OK });
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

		if (!planData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
		}

		//
		// Check if the user has permission to update the Plan

		const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData.gtfs_agency.agency_id,
		});

		if (!hasPermissionReadPlan) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this plan.');
		}

		//
		// Validate the new feed info dates

		const validatedFeedStartDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_start_date);
		const validatedFeedEndDate = validateOperationalDate(request.body.gtfs_feed_info?.feed_end_date);

		if (validatedFeedStartDate > validatedFeedEndDate) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Feed start date cannot be after feed end date');
		}

		//
		// Check if the dates actually changed
		// to avoid unnecessary file updates

		if (planData.gtfs_feed_info.feed_start_date !== validatedFeedStartDate || planData.gtfs_feed_info.feed_end_date !== validatedFeedEndDate) {
			//

			//
			// Check if the user has permission to update the PCGI legacy field

			const hasPermissionUpdateFeedInfoDates = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.plans.actions.update_feed_info_dates,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.plans.scope,
				value: planData.gtfs_agency.agency_id,
			});

			if (!hasPermissionUpdateFeedInfoDates) {
				throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update the feed info dates.');
			}

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

			const hasPermissionUpdatePcgiLegacy = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.plans.actions.update_pcgi_legacy,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.plans.scope,
				value: planData.gtfs_agency.agency_id,
			});

			if (!hasPermissionUpdatePcgiLegacy) {
				throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update the PCGI legacy field.');
			}

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
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
