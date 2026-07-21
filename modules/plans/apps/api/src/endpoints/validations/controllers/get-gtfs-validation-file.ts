/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, gtfsValidations } from '@tmlmobilidade/interfaces';
import { type Attachment, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves the file for a Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function getGtfsValidationFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	//

	//
	// Get the requested Validation data

	const foundValidation = await gtfsValidations.findById(request.params.id);

	if (!foundValidation) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');

	//
	// Check if the user has permission to read the validation

	const hasPermissionReadValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.gtfs_agency.agency_id,
	});

	if (!hasPermissionReadValidation) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation file');

	//
	// Fetch the file associated with the validation

	const foundFile = await files.findById(foundValidation.file_id);

	if (!foundFile) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');

	reply.send({ data: foundFile, error: null, statusCode: HTTP_STATUS.OK });
}
