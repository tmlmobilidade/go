/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a zone by ID
 * @param request Fastify request containing zone ID in params
 * @param reply Fastify reply
 */
export async function lockZoneHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Zone>) {
	//

	//
	// Get the Zone from the database

	const zoneData = await goDb.offer.zones.findById(request.params.id);

	if (!zoneData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
	}

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.lock);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock zones');
	}

	//
	// Validate that user has permission for ALL of this zone's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: zoneData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock zone. You must have permission for all agencies involved.');
	}

	// If authorized, toggle the lock status of the zone
	await goDb.offer.zones.updateOne({ _id: request.params.id }, { is_locked: !zoneData.is_locked });
	const foundZone = await goDb.offer.zones.findById(request.params.id);
	if (!foundZone) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
	}

	return reply.send({ data: foundZone, error: null, statusCode: HTTP_STATUS.OK });

	//
}
