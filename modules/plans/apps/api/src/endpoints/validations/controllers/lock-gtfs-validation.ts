/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { gtfsValidations } from '@tmlmobilidade/interfaces';
import { type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Toggles the lock status of a GTFS Validation by ID.
 * @param request Fastify request containing GTFS Validation ID in params.
 * @param reply Fastify reply.
 */
export async function lockGtfsValidation(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<GtfsValidation>) {
	//

	//
	// Get the Validation from the database

	const foundValidation = await gtfsValidations.findById(request.params.id);

	if (!foundValidation) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');

	//
	// Check if the user has permission to toggle lock the Validation

	const hasPermissionLockValidation = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.gtfs_validations.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.gtfs_validations.scope,
		value: foundValidation.gtfs_agency.agency_id,
	});

	if (!hasPermissionLockValidation) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock validation');

	//
	// If authorized, toggle the lock status of the validation

	await gtfsValidations.toggleLockById(request.params.id);

	const updatedValidation = await gtfsValidations.findById(request.params.id);

	if (!updatedValidation) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');

	//
	// Return the updated Validation

	reply.send({ data: updatedValidation, error: null, statusCode: HTTP_STATUS.OK });
}
