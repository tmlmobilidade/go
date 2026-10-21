/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a fare by ID
 * @param request Fastify request containing fare ID in params
 * @param reply Fastify reply
 */
export async function deleteFareHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const { id } = request.params;
	const fare = await goDb.offer.fares.findById(id);

	if (!fare) {
		return sendErrorApiResponse(reply, {
			error: 'Fare not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for fares for the current user.

	const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.delete);

	//
	// If no permission found, deny access

	if (!userFarePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete fares',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this fare's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.fares.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: fare.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this fare. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.fares.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
