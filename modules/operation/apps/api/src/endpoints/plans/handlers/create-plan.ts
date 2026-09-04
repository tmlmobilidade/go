/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getPlanHash } from '@tmlmobilidade/go-operation-pckg-utils';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type CreatePlanDto, type Plan } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Creates a new plan from a validation ID.
 * @param request Fastify request containing plan data and operation plan file in multipart form
 * @param reply Fastify reply
 */
export async function createPlanHandler(request: FastifyRequest<{ Body: { validation_id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the validation data

	const validationData = await goDb.operation.gtfsValidations.findById(request.body.validation_id);

	//
	// Check if have permissions to create the plan

	const hasPermissionCreatePlan = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'create', scope: 'plans' },
		requiredValue: validationData.agency_id,
		resourceKey: 'agency_ids',
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
		apex_file_id: null,
		apps: {
			hub_publish_gtfs: {
				last_hash: null,
				message: null,
				metadata_hash: null,
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
		created_at: Dates.now('utc').unix_milliseconds,
		created_by: request.me._id,
		hash: '',
		is_locked: false,
		operation_file_id: null,
	};

	//
	// Insert the new plan data

	const planResult = await goDb.operation.plans.insertOne(newPlanData);

	//
	// Copy validation GTFS into the plan scope, then attach it to the plan.
	// Failure modes (handled by storage saga + hooks):
	// - copy fails → saga compensates blob/metadata; onRollback deletes the plan
	// - plan update fails → onSuccess throws → onRollback deletes the plan → saga compensates the copy

	await storageProvider.copy(validationData.file_id, 'plans', planResult._id, {
		onRollback: async () => {
			await goDb.operation.plans.deleteById(planResult._id);
			throw new Error('Failed to copy validation GTFS into the plan scope');
		},
		onSuccess: async (_ctx, result) => {
			// Get a new hash for this plan
			const hashValue = await getPlanHash({
				activeFrom: planResult.active_from,
				activeUntil: planResult.active_until,
				operationFileId: result._id,
				planId: planResult._id,
			});
			// Update the plan in the database
			await goDb.operation.plans.updateById(planResult._id, {
				hash: hashValue,
				operation_file_id: result._id,
			});
		},
	});

	//
	// Return the success response

	const createdPlanData = await goDb.operation.plans.findById(planResult._id);

	if (!createdPlanData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID "${planResult._id}" not found after creating the plan.`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, createdPlanData);
}
