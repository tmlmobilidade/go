/* * */

import { updateFeedInfoDates } from '@/utils/file-utils.js';
import { HTTP_STATUS, HttpException, mimeTypes } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, plans } from '@tmlmobilidade/interfaces';
import { type CreateFileDto, HashablePlanMetadata, PermissionCatalog, type Plan, type UpdatePlanDto, validateOperationalDate } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/**
 * Updates an existing plan by ID
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updatePlan(request: FastifyRequest<{ Body: UpdatePlanDto, Params: { id: string } }>, reply: FastifyReply<Plan>) {
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
