/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation, PermissionCatalog, type ProcessingStatus } from '@tmlmobilidade/types';

/**
 * Updates the processing status of a GTFS Validation by ID.
 * @param request Fastify request containing GTFS Validation ID in params and processing status in body.
 * @param reply Fastify reply.
 */
export async function updateProcessingStatus(request: FastifyRequest<{ Body: { processing_status: ProcessingStatus }, Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested Validation data

	const gtfsValidationData = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!gtfsValidationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'GTFS Validation not found');
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: change status validation');
	}

	//
	// Update the Validation document and send it to caller

	const updatedGtfsValidation = await goDb.operation.gtfsValidations.updateById(gtfsValidationData._id, {
		processing_status: request.body.processing_status ?? 'error',
		validation_attempts: 0,
		validity_status: 'unknown',
	});

	reply.send({ data: updatedGtfsValidation, error: null, statusCode: HTTP_STATUS.OK });

	//
}
