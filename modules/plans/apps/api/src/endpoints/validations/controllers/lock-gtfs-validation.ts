/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a GTFS Validation by ID.
 * @param request Fastify request containing GTFS Validation ID in params.
 * @param reply Fastify reply.
 */
export async function lockGtfsValidation(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested Validation data

	const foundValidation = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!foundValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to toggle lock the validation

	const hasPermissionLockValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.agency_id,
	});

	if (!hasPermissionLockValidation) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock validation',
			status_code: '403',
		});
	}

	//
	// If authorized, toggle the lock status of the validation

	await goDb.operation.gtfsValidations.toggleLockById(request.params.id);

	const updatedValidation = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!updatedValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Return the updated Validation

	return sendSuccessApiResponse(reply, updatedValidation);
}
