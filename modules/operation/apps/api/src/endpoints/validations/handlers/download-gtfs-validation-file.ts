/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Download the operation file associated with a plan by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function downloadGtfsValidationFileHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
	//

	//
	// Get the Validation from the database

	const foundValidation = await goDb.operation.gtfsValidations.findById(request.params.id);

	if (!foundValidation) {
		return sendErrorApiResponse(reply, {
			error: 'Validation not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to read the Validation

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

	const foundFileData = await storageProvider.findById(foundValidation.file_id);

	if (!foundFileData) {
		return sendErrorApiResponse(reply, {
			error: 'Validation file not found',
			status_code: '404',
		});
	}

	//
	// Stream the file in the given URL to the client

	const storageServiceResponse = await fetch(foundFileData.url);

	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		return sendErrorApiResponse(reply, {
			error: 'Could not fetch file',
			status_code: '500',
		});
	}

	//
	// Set headers and pipe the response body to the client

	reply.header('Content-Disposition', `attachment; filename="${foundFileData.name}"`);
	reply.header('Content-Type', 'application/zip');

	//
	// Set content length if available

	const contentLength = storageServiceResponse.headers.get('Content-Length');
	if (contentLength) reply.header('Content-Length', contentLength);

	//
	// Pipe the response body to the client

	return reply.send(storageServiceResponse.body);
}
