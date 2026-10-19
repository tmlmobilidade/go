/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateZoneDto, type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing zone by ID
 * @param request Fastify request containing zone ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateZoneHandler(request: FastifyRequest<{ Body: UpdateZoneDto, Params: { id: string } }>, reply: FastifyReply<Zone>) {
	//

	//
	// Get the Zone from the database

	const zoneData = await goDb.offer.zones.findById(request.params.id);

	if (!zoneData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
	}

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.update);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update zones');
	}

	//
	// Validate that user has permission for ALL of this zone's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: zoneData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this zone. You must have permission for all agencies involved.');
	}

	//
	// Update the zone

	const updatedZone = await goDb.offer.zones.updateById(zoneData._id, request.body);

	//
	// Send the updated zone data as the response

	reply.send({
		data: updatedZone,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
