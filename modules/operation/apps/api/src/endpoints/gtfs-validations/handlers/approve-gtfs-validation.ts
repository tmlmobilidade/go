/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getPlanHash } from '@tmlmobilidade/go-operation-pckg-utils';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type CreatePlanDto, type Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Approves a GTFS validation, creating a new plan from it.
 * @param request Fastify request containing the validation ID to approve
 * @param reply Fastify reply
 */
export async function approveGtfsValidationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the validation data

	const validationData = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!validationData) {
		return sendErrorApiResponse(reply, {
			error: 'GTFS Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if have permissions to create the plan

	const hasPermissionCreatePlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: validationData.agency_id,
	});

	if (!hasPermissionCreatePlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create this plan.',
			status_code: '403',
		});
	}

	//
	// Create the new plan data

	const newPlanData: CreatePlanDto = {
		active_from: validationData.gtfs_feed_info.feed_start_date,
		active_until: validationData.gtfs_feed_info.feed_end_date,
		agency_id: validationData.agency_id,
		apps: {
			hub_publish_gtfs: {
				message: null,
				status: 'waiting',
				timestamp: null,
			},
			hub_publish_gtfs_cm: {
				last_hash: null,
				message: null,
				metadata_hash: null,
				status: 'waiting',
				timestamp: null,
			},
			organizer: {
				last_hash: null,
				message: null,
				metadata_hash: null,
				status: 'waiting',
				timestamp: null,
			},
			rides_feeder: {
				last_hash: null,
				message: null,
				status: 'waiting',
				timestamp: null,
			},
		},
		attachments: {
			apex_config: null,
			operation_gtfs: null,
			operation_gtfs_normalized: null,
		},
		created_at: Dates.now('utc').unix_milliseconds,
		created_by: request.me._id,
		hash: '',
		is_locked: false,
	};

	//
	// Insert the new plan data

	const insertPlanResult = await goDb.operation.plans.insertOne(newPlanData);

	//
	// Download the validation GTFS file from the storage provider and copy it into the plan scope.

	const findGtfsValidationAttachmentResult = await storageProvider.findById(validationData.file_id);

	if (!findGtfsValidationAttachmentResult?.url) {
		return sendErrorApiResponse(reply, {
			error: 'GTFS Validation attachment not found',
			status_code: '404',
		});
	}

	const downloadResponse = await fetch(findGtfsValidationAttachmentResult.url);
	const downloadArrayBuffer = await downloadResponse.arrayBuffer();

	await storageProvider.upload(
		Buffer.from(downloadArrayBuffer),
		{
			created_by: 'system',
			name: findGtfsValidationAttachmentResult.name,
			resource_id: insertPlanResult._id,
			scope: 'plans',
			size: downloadArrayBuffer.byteLength,
			type: 'application/zip',
			updated_by: 'system',
		},
		{
			onSuccess: async (_, result, session) => {
				const plansCollection = await goDb.operation.plans.getCollection();
				await plansCollection.updateOne(
					{ _id: insertPlanResult._id },
					{ $set: { 'attachments.operation_gtfs': result._id } },
					{ session },
				);
			},
		},
	);

	//
	// Get a new hash for this plan

	const createdPlanData = await goDb.operation.plans.findById(insertPlanResult._id);

	if (!createdPlanData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID "${insertPlanResult._id}" not found after creating the plan.`,
			status_code: '404',
		});
	}

	if (!createdPlanData.attachments.operation_gtfs) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID "${createdPlanData._id}" does not have an operation GTFS attachment.`,
			status_code: '404',
		});
	}

	const hashValue = await getPlanHash({
		activeFrom: createdPlanData.active_from,
		activeUntil: createdPlanData.active_until,
		operationGtfsAttachmentId: createdPlanData.attachments.operation_gtfs,
		operationGtfsNormalizedAttachmentId: createdPlanData.attachments.operation_gtfs_normalized,
		planId: createdPlanData._id,
	});

	const updatePlanHashResult = await goDb.operation.plans.updateById(createdPlanData._id, { hash: hashValue });

	//
	// Return the success response

	return sendSuccessApiResponse(reply, updatePlanHashResult);
}
