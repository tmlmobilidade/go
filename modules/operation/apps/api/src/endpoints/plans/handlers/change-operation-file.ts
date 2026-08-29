/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { HashablePlanMetadata, Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { createHash } from 'node:crypto';

/**
 * Change the GTFS file of a plan by its _id.
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function changeOperationFileHandler(request: FastifyRequest<{ Body: { validation_id: string }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);
	if (!planData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	const originalFileId = planData.operation_file_id;
	const originalApps = planData.apps;
	const originalGtfsAgency = planData.gtfs_agency;
	const originalGtfsFeedInfo = planData.gtfs_feed_info;
	const originalHash = planData.hash;

	// Check if the user has permission to change the GTFS of the Plan
	const hasPermissionChangeGtfsPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_gtfs_plan,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	// Throw an error if the user is not authorized
	if (!hasPermissionChangeGtfsPlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to change the GTFS of the plan.',
			status_code: '403',
		});
	}

	// For a given validation ID, get the validation data
	const validationData = await goDb.operation.gtfsValidations.findById(request.body.validation_id);
	if (!validationData) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Copy validation GTFS into the plan scope, then point the plan at it and drop the old file.
	// Failure modes (handled by storage saga + hooks):
	// - copy fails → saga compensates blob/metadata; plan untouched
	// - plan update fails → onSuccess throws → saga compensates the copy
	// - old-file delete fails → onSuccess throws → onRollback restores plan → saga compensates the copy

	let updatedPlanData: null | Plan = null;
	const appsWaitingForReprocessing: Plan['apps'] = {
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
	};

	await storageProvider.copy(
		validationData.file_id,
		PermissionCatalog.all.plans.scope,
		planData._id.toString(),
		{
			onRollback: async () => {
				if (!updatedPlanData) return;
				await goDb.operation.plans.updateById(planData._id, {
					apps: originalApps,
					gtfs_agency: originalGtfsAgency,
					gtfs_feed_info: originalGtfsFeedInfo,
					hash: originalHash,
					operation_file_id: originalFileId,
				});
				updatedPlanData = null;
			},
			onSuccess: async (_ctx, result) => {
				const hashablePlanMetadata: HashablePlanMetadata = {
					_id: planData._id,
					gtfs_agency: validationData.gtfs_agency,
					gtfs_feed_info: validationData.gtfs_feed_info,
					operation_file_id: result._id,
				};

				const hashValue = createHash('sha256')
					.update(JSON.stringify(hashablePlanMetadata))
					.digest('hex');

				updatedPlanData = await goDb.operation.plans.updateById(
					planData._id,
					{
						apps: appsWaitingForReprocessing,
						gtfs_agency: validationData.gtfs_agency,
						gtfs_feed_info: validationData.gtfs_feed_info,
						hash: hashValue,
						operation_file_id: result._id,
					},
				);

				await storageProvider.delete(originalFileId);
			},
		},
	);

	//
	// Send the updated plan data as the response

	return sendSuccessApiResponse(reply, updatedPlanData);
}
