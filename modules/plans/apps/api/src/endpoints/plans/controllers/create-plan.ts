/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { CreatePlanDto, HashablePlanMetadata, Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { createHash } from 'node:crypto';

/**
 * Creates a new plan from a validation ID.
 * @param request Fastify request containing plan data and operation plan file in multipart form
 * @param reply Fastify reply
 */
export async function createPlan(request: FastifyRequest<{ Body: { validation_id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the validation data

	const validationData = await goDb.operation.gtfsValidations.findById(request.body.validation_id);

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
		agency_id: validationData.agency_id,
		apex_file_id: null,
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
		},
		created_at: Dates.now('utc').unix_timestamp,
		created_by: request.me._id,
		gtfs_agency: validationData.gtfs_agency,
		gtfs_feed_info: validationData.gtfs_feed_info,
		hash: '',
		is_locked: false,
		operation_file_id: null,
		pcgi_legacy: {
			operation_plan_id: '',
		},
	};

	//
	// Insert the new plan data

	const planResult = await goDb.operation.plans.insertOne(newPlanData);

	//
	// Copy validation GTFS into the plan scope, then attach it to the plan.
	// Failure modes (handled by storage saga + hooks):
	// - copy fails → saga compensates blob/metadata; onRollback deletes the plan
	// - plan update fails → onSuccess throws → onRollback deletes the plan → saga compensates the copy

	let finalPlanData: null | Plan = null;

	await storageProvider.copy(
		validationData.file_id,
		PermissionCatalog.all.plans.scope,
		planResult._id.toString(),
		{
			onRollback: async () => {
				await goDb.operation.plans.deleteById(planResult._id);
				finalPlanData = null;
			},
			onSuccess: async (_ctx, result) => {
				const hashablePlanMetadata: HashablePlanMetadata = {
					_id: planResult._id,
					gtfs_agency: planResult.gtfs_agency,
					gtfs_feed_info: planResult.gtfs_feed_info,
					operation_file_id: result._id,
				};

				const hashValue = createHash('sha256')
					.update(JSON.stringify(hashablePlanMetadata))
					.digest('hex');

				finalPlanData = await goDb.operation.plans.updateById(
					planResult._id,
					{ hash: hashValue, operation_file_id: result._id },
				);
			},
		},
	);

	//
	// Return the success response

	return sendSuccessApiResponse(reply, finalPlanData);
}
