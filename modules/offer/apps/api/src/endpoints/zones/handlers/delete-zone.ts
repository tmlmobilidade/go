/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a zone by ID
 * @param request Fastify request containing zone ID in params
 * @param reply Fastify reply
 */
export async function deleteZoneHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const { id } = request.params;
	const zone = await goDb.offer.zones.findById(id);

	if (!zone) {
		return sendErrorApiResponse(reply, {
			error: 'Zone not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.delete);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete zones',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this zone's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: zone.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this zone. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.zones.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
