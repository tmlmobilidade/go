/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function getGtfsValidationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested validation data

	const foundValidation = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!foundValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to read the validation

	const hasPermissionReadValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.agency_id,
	});

	if (!hasPermissionReadValidation) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: read validation',
			status_code: '403',
		});
	}

	//
	// Return the found Validation

	return sendSuccessApiResponse(reply, foundValidation);
}
