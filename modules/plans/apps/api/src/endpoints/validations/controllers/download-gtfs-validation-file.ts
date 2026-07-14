/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { files } from '@tmlmobilidade/interfaces';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Download the operation file associated with a plan by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function downloadGtfsValidationFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
	// Get the Validation from the database
	const foundValidation = await goDB.operation.gtfsValidations.findById(request.params.id);
	if (!foundValidation) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
	}

	// Check if the user has permission to read the Validation
	const hasPermissionReadValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.gtfs_agency.agency_id,
	});
	if (!hasPermissionReadValidation) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation file');
	}

	// Fetch the file associated with the validation
	const foundFileData = await files.findById(foundValidation.file_id);
	if (!foundFileData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation file not found');
	}

	// Stream the file in the given URL to the client
	const storageServiceResponse = await fetch(foundFileData.url);
	if (!storageServiceResponse.ok || !storageServiceResponse.body) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Could not fetch file');
	}

	// Set headers and pipe the response body to the client
	reply.header('Content-Disposition', `attachment; filename="${foundFileData.name}"`);
	reply.header('Content-Type', 'application/zip');
	// Set content length if available
	const contentLength = storageServiceResponse.headers.get('Content-Length');
	if (contentLength) reply.header('Content-Length', contentLength);
	// Pipe the response body to the client
	return reply.send(storageServiceResponse.body);
}
