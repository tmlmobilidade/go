/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { HashablePlanMetadata, PermissionCatalog, type Plan } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/**
 * Change the GTFS file of a plan by its _id.
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function changeOperationFile(request: FastifyRequest<{ Body: { validation_id: string }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);
	if (!planData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
	}

	const originalFileId = planData.operation_file_id;
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to change the GTFS of the plan.');
	}

	// For a given validation ID, get the validation data
	const validationData = await goDb.operation.gtfsValidations.findById(request.body.validation_id);
	if (!validationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
	}

	//
	// Copy validation GTFS into the plan scope, then point the plan at it and drop the old file.
	// Failure modes (handled by storage saga + hooks):
	// - copy fails → saga compensates blob/metadata; plan untouched
	// - plan update fails → onSuccess throws → saga compensates the copy
	// - old-file delete fails → onSuccess throws → onRollback restores plan → saga compensates the copy

	let updatedPlanData: null | Plan = null;

	await storageProvider.copy(
		validationData.file_id,
		PermissionCatalog.all.plans.scope,
		planData._id.toString(),
		{
			onRollback: async () => {
				if (!updatedPlanData) return;
				await goDb.operation.plans.updateById(planData._id, {
					hash: originalHash,
					operation_file_id: originalFileId,
				});
				updatedPlanData = null;
			},
			onSuccess: async (_ctx, result) => {
				const hashablePlanMetadata: HashablePlanMetadata = {
					_id: planData._id,
					gtfs_agency: planData.gtfs_agency,
					gtfs_feed_info: planData.gtfs_feed_info,
					operation_file_id: result._id,
				};

				const hashValue = createHash('sha256')
					.update(JSON.stringify(hashablePlanMetadata))
					.digest('hex');

				updatedPlanData = await goDb.operation.plans.updateById(
					planData._id,
					{ hash: hashValue, operation_file_id: result._id },
				);

				await storageProvider.delete(originalFileId);
			},
		},
	);

	// Send the updated plan data as the response
	reply.send({ data: updatedPlanData, error: null, statusCode: HTTP_STATUS.OK });
}
