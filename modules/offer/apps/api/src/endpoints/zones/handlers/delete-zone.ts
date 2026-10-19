/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
	}

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.delete);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete zones');
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this zone. You must have permission for all agencies involved.');
	}

	//

	await goDb.offer.zones.deleteById(id);

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
