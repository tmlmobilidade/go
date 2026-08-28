/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';

/**
 * Updates the processing status of a GTFS Validation by ID.
 * @param request Fastify request containing GTFS Validation ID in params and processing status in body.
 * @param reply Fastify reply.
 */
export async function updateProcessingStatusHandler(request: FastifyRequest<{ Body: { processing_status: ProcessingStatus }, Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested Validation data

	const gtfsValidationData = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!gtfsValidationData) {
		return sendErrorApiResponse(reply, {
			error: 'GTFS Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to change the status of the Validation

	const hasPermissionChangeStatus = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.update_processing_status,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: gtfsValidationData.agency_id,
	});

	if (!hasPermissionChangeStatus) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: change status validation',
			status_code: '403',
		});
	}

	//
	// Update the Validation document and send it to caller

	const updatedGtfsValidation = await goDb.operation.gtfsValidations.updateById(gtfsValidationData._id, {
		processing_status: request.body.processing_status ?? 'error',
		validation_attempts: 0,
		validity_status: 'unknown',
	});

	if (!updatedGtfsValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to update GTFS Validation',
			status_code: '404',
		});
	}

	//
	// Return the updated GTFS Validation

	return sendSuccessApiResponse(reply, updatedGtfsValidation);

	//
}
