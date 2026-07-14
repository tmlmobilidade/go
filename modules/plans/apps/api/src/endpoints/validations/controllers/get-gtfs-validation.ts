/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves a single Validation by ID
 * @param request Fastify request containing Validation ID in params
 * @param reply Fastify reply
 */
export async function getGtfsValidation(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the requested validation data

	const foundValidation = await goDB.operation.gtfsValidations.findById(request.params.id);
	if (!foundValidation) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
	}

	//
	// Check if the user has permission to read the validation

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.gtfs_agency.agency_id,
	})) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read validation');
	}

	//
	// Return the found Validation

	reply.send({ data: foundValidation, error: null, statusCode: HTTP_STATUS.OK });
}
