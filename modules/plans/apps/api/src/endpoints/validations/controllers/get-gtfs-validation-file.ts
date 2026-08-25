/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Attachment } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves the file for a Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function getGtfsValidationFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
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
			error: 'You are not authorized to perform this action: read validation file',
			status_code: '403',
		});
	}

	//
	// Fetch the file associated with the validation

	const foundFile = await storageProvider.findById(foundValidation.file_id);

	if (!foundFile) {
		return sendErrorApiResponse(reply, {
			error: 'Validation file not found',
			status_code: '404',
		});
	}

	//
	// Return the success response

	return sendSuccessApiResponse(reply, foundFile);
}
